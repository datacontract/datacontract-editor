#!/usr/bin/env python3
"""Keep editor.datacontract.com and datacontract.com on the latest released editor.

Both sites publish the editor version they run as datacontract-editor-version.json.
This script compares it with the latest datacontract-editor on npm and, when a site
is behind, updates it:

- editor.datacontract.com is built from main, so it is redeployed.
- datacontract.com bundles the editor from npm, so datacontract/datacontract gets the
  dependency bump pushed to main (which deploys it), or is redeployed when it already
  has the latest version but the deployment did not go through.

Environment:
  GH_TOKEN       token that may run workflows in datacontract/datacontract-editor
  WEBSITE_TOKEN  token that may push to and run workflows in datacontract/datacontract

Usage: update_deployments.py [--dry-run]
"""

import argparse
import json
import os
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
from pathlib import Path

PACKAGE = "datacontract-editor"
VERSION_FILE = "datacontract-editor-version.json"
REPO_ROOT = Path(__file__).resolve().parents[2]

EDITOR_SITE = "https://editor.datacontract.com"
EDITOR_REPO = "datacontract/datacontract-editor"
EDITOR_DEPLOY_WORKFLOW = "azure-static-web-apps-orange-desert-03e149203.yml"

WEBSITE = "https://datacontract.com"
WEBSITE_REPO = "datacontract/datacontract"
WEBSITE_DEPLOY_WORKFLOW = "pages.yml"


def parse_version(version):
    return tuple(int(part) for part in version.split("."))


def fetch_json(url):
    request = urllib.request.Request(url, headers={"Cache-Control": "no-cache", "User-Agent": "update-deployments"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def latest_release():
    return fetch_json(f"https://registry.npmjs.org/{PACKAGE}/latest")["version"]


def deployed_version(site):
    """The editor version a site runs, or None when the site does not publish it."""
    try:
        return fetch_json(f"{site}/{VERSION_FILE}")["version"]
    except urllib.error.HTTPError as error:
        if error.code == 404:
            return None
        raise
    except json.JSONDecodeError:
        # a single-page app may answer an unknown path with its HTML page
        return None


def is_up_to_date(deployed, latest):
    return deployed is not None and parse_version(deployed) >= parse_version(latest)


def run(command, *, cwd=None, env=None, dry_run=False, redact=None):
    shown = " ".join(command)
    if redact:
        shown = shown.replace(redact, "***")
    if dry_run:
        print(f"  would run: {shown}")
        return
    print(f"  running: {shown}")
    subprocess.run(command, cwd=cwd, env=env, check=True)


def update_editor_site(latest, dry_run):
    deployed = deployed_version(EDITOR_SITE)
    print(f"{EDITOR_SITE} runs {deployed or 'an unknown version'}, latest is {latest}")
    if is_up_to_date(deployed, latest):
        return True

    # the site is built from main, so a redeploy only helps when main has the release
    main_version = json.loads((REPO_ROOT / "package.json").read_text())["version"]
    if main_version != latest:
        print(f"  cannot update: main is at {main_version}, not {latest}. Did the release commit its version bump?")
        return False

    run(["gh", "workflow", "run", EDITOR_DEPLOY_WORKFLOW, "--ref", "main", "-R", EDITOR_REPO], dry_run=dry_run)
    return True


def update_website(latest, dry_run):
    deployed = deployed_version(WEBSITE)
    print(f"{WEBSITE} runs {deployed or 'an unknown version'}, latest is {latest}")
    if is_up_to_date(deployed, latest):
        return True

    token = os.environ.get("WEBSITE_TOKEN")
    if not token and not dry_run:
        print("  cannot update: WEBSITE_TOKEN is not set")
        return False
    env = dict(os.environ, GH_TOKEN=token) if token else None

    with tempfile.TemporaryDirectory() as workdir:
        checkout = Path(workdir) / "website"
        clone_url = f"https://x-access-token:{token}@github.com/{WEBSITE_REPO}.git" if token else f"https://github.com/{WEBSITE_REPO}.git"
        run(["git", "clone", "--quiet", "--depth", "1", clone_url, str(checkout)], redact=token)

        lock = json.loads((checkout / "package-lock.json").read_text())
        locked = lock["packages"][f"node_modules/{PACKAGE}"]["version"]
        if parse_version(locked) >= parse_version(latest):
            # the repository is current, so the last deployment did not go through
            print(f"  {WEBSITE_REPO} already uses {locked}, redeploying")
            run(["gh", "workflow", "run", WEBSITE_DEPLOY_WORKFLOW, "--ref", "main", "-R", WEBSITE_REPO], env=env, dry_run=dry_run)
            return True

        print(f"  {WEBSITE_REPO} uses {locked}, bumping to {latest}")
        git = ["git", "-c", "user.name=github-actions[bot]", "-c", "user.email=github-actions[bot]@users.noreply.github.com"]
        run(["npm", "install", f"{PACKAGE}@^{latest}", "--save", "--ignore-scripts", "--no-audit", "--no-fund"], cwd=checkout, dry_run=dry_run)
        run(git + ["commit", "-am", f"Bump {PACKAGE} to {latest}"], cwd=checkout, dry_run=dry_run)
        run(git + ["push", "origin", "HEAD:main"], cwd=checkout, dry_run=dry_run)
    return True


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--dry-run", action="store_true", help="only report what would be updated")
    args = parser.parse_args()

    latest = latest_release()
    results = [update_editor_site(latest, args.dry_run), update_website(latest, args.dry_run)]
    return 0 if all(results) else 1


if __name__ == "__main__":
    sys.exit(main())
