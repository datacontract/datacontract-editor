# Customization

This document describes how to customize the Data Contract Editor using a `customization.yaml` configuration file.

## Overview

The customization system allows organizations to:
1. **Customize standard properties** (`standardProperties`) - modify descriptions, restrict values, add validation, or hide them
2. **Add custom properties** (`customProperties`) - define new properties to capture additional metadata
3. **Organize into UI sections** (`customSections`) - group custom properties into collapsible sections in the editor

## Configuration File

Create a `customization.yaml` file in your project root or specify a path via the `CUSTOMIZATION_CONFIG` environment variable.

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
```

---

## 1. Levels

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

## 2. Standard Properties

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
```

### Available Properties by Level

#### root
- `name`, `version`, `status`, `domain`, `tenant`, `tags`

#### description
- `purpose`, `usage`, `limitations`

#### schema
- `name`, `physicalType`, `physicalName`, `description`, `businessName`, `dataGranularityDescription`

#### schema.properties
- `name`, `logicalType`, `physicalType`, `physicalName`, `description`, `businessName`
- `required`, `unique`, `primaryKey`, `partitioned`, `classification`
- `encryptedName`, `transformLogic`, `transformDescription`, `transformSourceObjects`
- `criticalDataElement`, `examples`

#### servers
- `server`, `type`, `environment`, `description`

#### team
- `name`, `description`

#### team.members
- `username`, `name`, `role`, `description`, `dateIn`, `dateOut`

#### roles
- `role`, `description`, `access`, `firstLevelApprovers`, `secondLevelApprovers`

#### support
- `channel`, `url`, `description`, `tool`, `scope`, `invitationUrl`

---

## 3. Custom Properties

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
```

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
| `boolean` | Toggle/checkbox | - |
| `date` | Date picker | `minimum`, `maximum` |
| `datetime` | Date and time picker | `minimum`, `maximum` |
| `url` | URL input with validation | `pattern` |
| `email` | Email input with validation | - |

### Enum Definition

For `select` and `multiselect` types:

```yaml
enum:
  - "option1"
  - "option2"
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

## 4. Custom Sections

Group custom properties into collapsible UI sections in the editor.

### Structure

```yaml
dataContract:
  <level>:
    customSections:
      - section: "section-id"        # Unique section identifier
        title: "Section Label"       # UI section heading
        positionAfter: "overview"    # Position relative to existing sections
        customProperties:
          - propertyName             # Reference to custom property defined above
```


## 5. Complete Example

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



## 6. Loading Customizations

### Programmatic (Recommended)

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
            enum: ["none", "direct-identifier", "quasi-identifier"]
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
