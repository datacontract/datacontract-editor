# Customization

This document describes how to customize the Data Contract Editor using a `customization.yaml` configuration file.

## Overview

The customization system allows organizations to:
1. **Customize standard properties** (`standardProperties`) - modify descriptions, restrict values, add validation, or hide them
2. **Add custom properties** (`customProperties`) - define new properties to capture additional metadata
3. **Organize into UI sections** (`customSections`) - group custom properties into collapsible sections in the editor

## Configuration File

Create a `customization.yaml` file in the directory you start the editor from, or point the
`CUSTOMIZATION_CONFIG` environment variable (or the `--customization` CLI flag) at a file.
See [Loading Customizations](#loading-customizations) for the details per deployment mode.

```yaml
# customization.yaml
dataContract:
  # Each section can have standardProperties, customProperties, and customSections
  root:
    standardProperties: []
    customProperties: []
    customSections: []

  schema:
    standardProperties: []
    customProperties: []
    customSections: []

  schema.properties:
    standardProperties: []
    customProperties: []
    customSections: []

  servers:
    standardProperties: []
    customProperties: []
    customSections: []

yamlFormat:
  removeTrailingWhitespace: true # default: true
  addFinalNewline: true          # default: true
```

---

## Levels

Each level corresponds to a location in the ODCS data contract where customizations can be applied.

| Level | Location in Editor | Custom Properties Stored In |
|-------|-------------------|----------------------------|
| `root` | Sidebar navigation / Overview | Root `customProperties` |
| `description` | Description section | `description.customProperties` |
| `schema` | Schema object editor | `schema[*].customProperties` |
| `schema.properties` | Property detail drawer | `schema[*].properties[*].customProperties` |
| `servers` | Server editor | `servers[*].customProperties` |
| `team` | Team section | `team.customProperties` |
| `team.members` | Team member editor | `team.members[*].customProperties` |
| `roles` | Role editor | `roles[*].customProperties` |
| `support` | Support channel editor | `support[*].customProperties` |

---

## 1. Standard Properties

Modify the behavior of existing ODCS standard properties, or hide them entirely.

### Structure

```yaml
dataContract:
  <level>:
    standardProperties:
      - property: "propertyName"      # Property name (relative to level)
        title: "New Label"            # Override display label
        description: "New description" # Override help text
        placeholder: "New placeholder" # Override placeholder
        required: true                # Make required
        enum: []                      # Restrict to specific values
        pattern: "regex"              # Add regex validation
        patternMessage: "Error message" # Custom validation message
        default: "value"              # Set default value
        hidden: true                  # Hide from the editor
        minLength: 1                  # Minimum length (for text fields)
        maxLength: 255                # Maximum length (for text fields)
```

### Risks of Regular Expressions

The `pattern` field accepts regular expressions for input validation. Be aware that poorly crafted regular expressions can cause **Regular Expression Denial of Service (ReDoS)** — a condition where certain input strings cause the regex engine to take exponentially long to evaluate, freezing the browser tab. Avoid nested quantifiers (e.g., `(a+)+`), overlapping alternations, and other constructs that lead to catastrophic backtracking. Keep patterns simple and test them against adversarial input before deploying. If you only need to check for allowed characters or a fixed format, prefer straightforward character classes (e.g., `^[a-z0-9-]+$`) over complex expressions.

### Available Properties by Level

#### root
- `id`, `name`, `version`, `status`, `domain`, `tenant`, `tags`

#### description
- `purpose`, `usage`, `limitations`, `authoritativeDefinitions`

#### schema
- `name`, `logicalType`, `physicalType`, `physicalName`, `description`, `businessName`, `dataGranularityDescription`, `tags`

#### schema.properties
- `name`, `logicalType`, `physicalType`, `physicalName`, `description`, `businessName`
- `required`, `unique`, `primaryKey`, `partitioned`, `classification`
- `encryptedName`, `transformLogic`, `transformDescription`, `transformSourceObjects`
- `criticalDataElement`, `examples`

#### servers
- `server`, `type`, `environment`, `description`

#### team
- `name`, `description`, `tags`

#### team.members
- `username`, `name`, `role`, `description`, `dateIn`, `dateOut`

#### roles
- `role`, `description`, `access`, `firstLevelApprovers`, `secondLevelApprovers`

#### support
- `channel`, `url`, `description`, `tool`, `scope`, `invitationUrl`

> **Note:** override support is wired per field. `hidden` works for every property listed above. The other keys (`title`, `description`, `placeholder`, `required`, `enum`, `pattern`, `minLength`, `maxLength`) are honored only where the field supports them — for example `enum` applies to `schema.properties.classification`, `servers.type`, `servers.environment`, and `support.tool`/`scope`. Text fields honor `title`, `description`, `required`, `placeholder`, `minLength` and `maxLength`; this includes `team.description`, `schema.dataGranularityDescription`, and in `schema.properties` the fields `description`, `examples`, `transformSourceObjects`, `transformLogic` and `transformDescription` (for these, `description` renders as help text **below** the field, elsewhere it is the tooltip next to the label). The type selectors `schema.properties.logicalType` and `schema.properties.physicalType` honor `title`, `description`, `placeholder` and `required`. Boolean fields typically honor just `hidden` (and sometimes `title`). Where an override is not set, the built-in i18n label/help for the requested language is used.
>
> When every standard field of the property-level **Transformations** section is hidden and no custom property is anchored into it (`positionAfter` on one of its fields), the whole section is omitted instead of rendering an empty collapsible.

---

## 2. Custom Properties

Define custom properties to capture additional metadata.

### Structure

```yaml
dataContract:
  <level>:
    customProperties:
      - property: "technicalName"       # Technical name (stored in customProperties)
        title: "Display Label"          # Human-readable label
        type: "string"                  # Field type (see Property Types)
        placeholder: "Placeholder text" # Input placeholder
        description: "Help text"        # Description shown as tooltip
        required: true                  # Is field required?
        default: "defaultValue"         # Default value
        enum: []                        # Options for select/multiselect
        pattern: "^[a-z]+$"             # Regex validation pattern
        patternMessage: "Only lowercase" # Custom validation message
        minimum: 0                      # Minimum (for number types)
        maximum: 100                    # Maximum (for number types)
        minLength: 1                    # Minimum length (for text)
        maxLength: 255                  # Maximum length (for text)
        condition: "expression"         # Conditional display expression
        positionAfter: "description"    # Render inline after this property (standard or custom)
        hidden: true                    # Hide from form UI and preview (still editable in YAML editor)
        auto: true                      # Empty means the host derives the value (select/multiselect, root level); or { hint }
```

### Hiding properties from the form UI

Set `hidden: true` to keep a custom property out of the form-based editor and the preview/display view. The property still round-trips through the YAML untouched — Monaco YAML editing shows and edits it normally. Use this for fields managed externally (API/automation) that non-technical users should not see or edit. Mirrors the `hidden` semantics already supported on standard properties.

### Auto values derived by the host

Set `auto: true` on a root-level `select` or `multiselect` property whose empty value means "derive it", for example a contract-level classification that the host rolls up from the schema's columns. The field then shows an explicit **Auto** choice followed by one choice per enum option:

- The Auto choice shows the values the host currently derives. Choosing it clears the property.
- Picking an option sets the property explicitly, replacing what Auto would give.
- `auto: { hint: "From the schema" }` replaces the default hint shown under "Auto".
- When the host reports that the explicit value drops or weakens what Auto would give, a warning appears under the field.

The derived values come from the `autoValues.url` init option (see CONFIGURATION.md). The editor POSTs the current document to it, debounced while the user edits:

```
POST {autoValues.url}
{ "yaml": "<the current document>" }

200
{
  "properties": {
    "classification": {
      "values": ["Restricted"],
      "detail": "Restricted from ARTICLE_NAME",
      "warning": "Public is less sensitive than the schema, which has Restricted on ARTICLE_NAME."
    }
  }
}
```

`values` are shown on the Auto choice, `detail` as its tooltip, and `warning` under the field while an explicit value is set. The host computes the warning from the document it received, so the editor needs no knowledge of what the values mean. Without `autoValues.url` the Auto choice still works, it just shows no derived values.

### Positioning

By default, custom properties that aren't assigned to a `customSection` render in a group below the standard sections. Use `positionAfter` to place a property inline, right after a named anchor. The anchor can be:

- a standard property name at the same level (e.g., `description`, `classification`)
- another custom property name

Currently implemented in the property detail drawer (`schema.properties` level). If the referenced anchor doesn't exist or is hidden, the property won't render — check the browser console for a customization warning.

### Property Types

| Type | Description | Additional Options |
|------|-------------|-------------------|
| `text` | Single-line text input | `pattern`, `minLength`, `maxLength` |
| `textarea` | Multi-line text input | `rows`, `minLength`, `maxLength` |
| `number` | Numeric input | `minimum`, `maximum`, `step` |
| `integer` | Integer input | `minimum`, `maximum` |
| `select` | Single-select dropdown | `enum` (required) |
| `multiselect` | Multi-select dropdown | `enum` (required) |
| `array` | Array of strings | `placeholder`, `minItems`, `maxItems` |
| `yaml` | Any value (object, list, or scalar) edited as free-form YAML | - |
| `boolean` | Toggle/checkbox | - |
| `date` | Date picker | `minimum`, `maximum` |
| `datetime` | Date and time picker | `minimum`, `maximum` |
| `url` | URL input with validation | `pattern` |
| `email` | Email input with validation | - |

### Enum Definition

For `select` and `multiselect` types, enums can be defined in two formats:

**Simple string array:**
```yaml
enum:
  - "option1"
  - "option2"
```

**Value/label objects** (when display label differs from stored value):
```yaml
enum:
  - value: "opt1"
    label: "Option One"
  - value: "opt2"
    label: "Option Two"
```

Note: `title` is also supported as an alias for `label` for backwards compatibility.

On a property with `auto: true`, an option may also carry a `color` and an `icon`, used for its choice and for its badge on the Auto choice:

```yaml
enum:
  - value: "Restricted"
    label: "Restricted"
    color: "red"          # gray, red, orange, amber, yellow, green, teal, blue, indigo, purple or pink
    icon: "<svg ...>"     # SVG markup or an image URL, always rendered as an image
```

### Conditional Display

The `condition` field accepts expressions to conditionally show/hide properties.

Properties can be referenced from any level:

- **Root properties**: Use the property name directly (e.g., `status`, `domain`, `dataOwner`)
- **Other levels**: Use level prefix with dot notation (e.g., `schema.type`, `schema.properties.piiCategory`)

Examples:
- `status == 'active'`
- `domain == 'customer'`
- `status == 'active' && domain != null`
- `tags contains 'gdpr'`
- `tenant != null`

---

## 3. Custom Sections

Group custom properties into collapsible UI sections in the editor.

### Structure

```yaml
dataContract:
  <level>:
    customSections:
      - section: "section-id"        # Unique section identifier
        title: "Section Label"       # UI section heading
        positionAfter: "description" # Render the section inline after this anchor (standard or custom property)
        expanded: true               # Optional: expand section by default (default: false)
        customProperties:
          - propertyName             # Reference to custom property defined above
```

The `customProperties` list references custom property names defined under the same level. Names must match exactly — if a reference can't be resolved, the section is skipped and a warning is logged to the browser console (`[Customization] customSection "..." references unknown customProperties: ...`).

A section is **automatically hidden when all of its custom properties are hidden** — that is, every referenced property has `hidden: true` or is currently filtered out by its `condition`. This avoids showing an empty section header. The section keeps rendering as long as at least one of its properties is visible (including a `required` one), so a mandatory field is never hidden by this behavior.

`positionAfter` is currently supported in the property detail drawer (`schema.properties` level) and renders the section inline after the named anchor. Sections without `positionAfter` render below the standard sections in the order they're declared.


## Complete Example

```yaml
# customization.yaml

dataContract:
  root:
    standardProperties:
      - property: "status"
        enum:
          - "draft"
          - "in-review"
          - "approved"
          - "deprecated"

      - property: "domain"
        required: true
        enum:
          - "customer"
          - "product"
          - "finance"

      - property: "tenant"
        hidden: true

      - property: "price"
        hidden: true

    customProperties:
      - property: "dataOwner"
        title: "Data Owner"
        type: "email"
        required: true
        description: "Person accountable for this data asset"

      - property: "classification"
        title: "Data Classification"
        type: "select"
        required: true
        enum:
          - "public"
          - "internal"
          - "confidential"

      - property: "complianceFrameworks"
        title: "Compliance Frameworks"
        type: "multiselect"
        enum:
          - "gdpr"
          - "hipaa"
          - "sox"

    customSections:
      - section: "governance"
        title: "Governance"
        customProperties:
          - dataOwner
          - complianceFrameworks

  schema:
    standardProperties:
      - property: "physicalType"
        enum:
          - "table"
          - "view"
          - "topic"

    customProperties:
      - property: "retentionDays"
        title: "Retention Period (Days)"
        type: "integer"
        minimum: 1
        description: "Number of days to retain this data"

      - property: "archivePolicy"
        title: "Archive Policy"
        type: "select"
        enum:
          - "delete"
          - "archive-cold"
          - "archive-glacier"

    customSections:
      - section: "lifecycle"
        title: "Data Lifecycle"
        customProperties:
          - retentionDays
          - archivePolicy

  schema.properties:
    standardProperties:
      - property: "classification"
        required: true
        enum:
          - "public"
          - "internal"
          - "confidential"
          - "pii"

      - property: "encryptedName"
        hidden: true

      - property: "transformLogic"
        hidden: true

      - property: "transformDescription"
        hidden: true

    customProperties:
      - property: "piiCategory"
        title: "PII Category"
        type: "select"
        enum:
          - "none"
          - "direct-identifier"
          - "quasi-identifier"
          - "sensitive"

      - property: "gdprLegalBasis"
        title: "GDPR Legal Basis"
        type: "select"
        condition: "piiCategory != 'none'"
        enum:
          - "consent"
          - "contract"
          - "legal-obligation"
          - "legitimate-interest"

      - property: "maskingRule"
        title: "Masking Rule"
        type: "string"
        placeholder: "e.g., HASH, REDACT, PARTIAL"
        condition: "piiCategory != 'none'"

    customSections:
      - section: "privacy"
        title: "Privacy"
        customProperties:
          - piiCategory
          - gdprLegalBasis
          - maskingRule

  servers:
    standardProperties:
      - property: "type"
        enum:
          - "snowflake"
          - "bigquery"
          - "postgresql"
          - "s3"

      - property: "environment"
        enum:
          - "dev"
          - "staging"
          - "prod"

    customProperties:
      - property: "costCenter"
        title: "Cost Center"
        type: "string"
        pattern: "^CC-[0-9]{3,}$"
        patternMessage: "Must be in format CC-XXX"

      - property: "maintenanceWindow"
        title: "Maintenance Window"
        type: "select"
        enum:
          - "sun-02-06"
          - "sat-02-06"

    customSections:
      - section: "infrastructure"
        title: "Infrastructure"
        customProperties:
          - costCenter
          - maintenanceWindow

  team:
    customProperties:
      - property: "slackChannel"
        title: "Slack Channel"
        type: "string"
        placeholder: "#data-team"

      - property: "onCallRotation"
        title: "On-Call Rotation URL"
        type: "url"

    customSections:
      - section: "team-meta"
        title: "Team Metadata"
        customProperties:
          - slackChannel
          - onCallRotation

  team.members:
    customProperties:
      - property: "department"
        title: "Department"
        type: "string"

      - property: "location"
        title: "Location"
        type: "select"
        enum:
          - "us"
          - "eu"
          - "apac"

    customSections:
      - section: "member-details"
        title: "Member Details"
        customProperties:
          - department
          - location
```

---



## Loading Customizations

### CLI (`npx datacontract-editor`)

The CLI looks for a customization file in this order and uses the first match:

1. `--customization <path>` (`-c`) flag
2. `CUSTOMIZATION_CONFIG` environment variable (absolute path, or relative to the working directory)
3. `./customization.yaml` in the working directory

```bash
npx datacontract-editor                                   # picks up ./customization.yaml if present
npx datacontract-editor -c config/customization.yaml
CUSTOMIZATION_CONFIG=/etc/editor/customization.yaml npx datacontract-editor my.odcs.yaml
```

A file given explicitly via flag or env variable must exist and parse as YAML with a top-level
`dataContract` or `yamlFormat` key, otherwise the CLI exits with an error. The resolved file is
printed at startup.

### Docker

Mount the file into the container and reference it with `CUSTOMIZATION_CONFIG`:

```bash
docker run -p 4173:4173 \
  -v $(pwd)/customization.yaml:/customization.yaml:ro \
  -e CUSTOMIZATION_CONFIG=/customization.yaml \
  datacontract/editor
```

Alternatively mount it straight to `/usr/share/nginx/html/customization.yaml`. Either way the
frontend fetches `/customization.yaml` at startup. A `customizations` object in `/config.json`
takes precedence if both are present.

### Programmatic (Embedded)

Pass customizations directly to the `init()` function:

```javascript
import { init } from 'datacontract-editor';

const editor = init({
  selector: '#editor',
  customizations: {
    dataContract: {
      root: {
        standardProperties: [
          {
            property: "status",
            enum: ["draft", "active", "retired"]
          }
        ],
        customProperties: [
          {
            property: "dataOwner",
            title: "Data Owner",
            type: "email",
            required: true
          }
        ],
        customSections: [
          {
            section: "governance",
            title: "Governance",
            positionAfter: "overview",
            customProperties: ["dataOwner"]
          }
        ]
      },
      "schema.properties": {
        customProperties: [
          {
            property: "piiCategory",
            title: "PII Category",
            type: "select",
            enum: [
              { value: "none", label: "None" },
              { value: "direct-identifier", label: "Direct Identifier" },
              { value: "quasi-identifier", label: "Quasi Identifier" }
            ]
          }
        ],
        customSections: [
          {
            section: "privacy",
            title: "Privacy",
            customProperties: ["piiCategory"]
          }
        ]
      }
    }
  }
});
```

---
