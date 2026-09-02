import { compareApiVersions } from './apiVersion.js';

/**
 * Upgrades a contract's declared ODCS `apiVersion` to [toVersion], applying the structural
 * migrations a version jump requires — nothing more. The contract's own `version` and all other
 * content stay untouched; whether adopting a new spec version warrants a contract-version bump is
 * the author's call, not the upgrade's.
 *
 * Steps:
 * - crossing 3.1.0: the deprecated `team` array (a bare member list) becomes the `team` object
 *   with a `members` list.
 * - 3.1.0 → 3.2.0: nothing structural, the release is purely additive.
 *
 * Operates through the store's `getValue`/`setValue`, so the upgrade is an ordinary edit:
 * undoable, dirty-flagging, and visible to the host's `onSave` like any other change.
 *
 * @returns {boolean} whether anything was changed
 */
export function upgradeOdcsDocument({ getValue, setValue }, fromVersion, toVersion) {
  if (!toVersion) return false;
  if (fromVersion && compareApiVersions(fromVersion, toVersion) >= 0) return false;

  if (odcsUpgradeSteps(fromVersion, toVersion).includes('teamMembers')) {
    const team = getValue('team');
    if (Array.isArray(team) && team.length > 0) {
      setValue('team', { members: team });
    }
  }

  setValue('apiVersion', toVersion);
  return true;
}

/**
 * The structural steps [upgradeOdcsDocument] applies going from [fromVersion] to [toVersion], as
 * keys the UI can explain (`teamMembers`: the team array becomes the team object). Empty when the
 * jump changes nothing but `apiVersion`, as 3.1.0 → 3.2.0 does. The single source of truth for
 * both the upgrade and what the confirmation says it will do.
 */
export function odcsUpgradeSteps(fromVersion, toVersion) {
  const steps = [];
  if (
    (!fromVersion || compareApiVersions(fromVersion, 'v3.1.0') < 0) &&
    compareApiVersions(toVersion, 'v3.1.0') >= 0
  ) {
    steps.push('teamMembers');
  }
  return steps;
}
