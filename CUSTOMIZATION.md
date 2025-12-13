# Customization (TBD)

This document describes how to customize the Data Contract Editor using a `customization.yaml` configuration file.

## Overview

The customization system allows organizations to:
1. **Add custom sections** with custom properties at different levels of the data contract
2. **Customize standard properties** (modify descriptions, restrict values, add validation, or hide them)

## Configuration File

Create a `customization.yaml` file in your project root or specify a path via the `CUSTOMIZATION_CONFIG` environment variable.

```yaml
# customization.yaml

# Each scope can have customProperties and/or properties
fundamentals:
  customProperties: []
  properties: []

schema:
  customProperties: []
  properties: []

schema.properties:
  customProperties: []
  properties: []

servers:
  customProperties: []
  properties: []
```

---

## 1. Scopes

Each scope corresponds to a level in the ODCS data contract where customizations can be applied.

| Scope | Location in Editor | Custom Properties Stored In |
|-------|-------------------|----------------------------|
| `fundamentals` | Sidebar navigation / Overview | Root `customProperties` |
| `description` | Description section | `description.customProperties` |
| `schema` | Schema object editor | `schema[*].customProperties` |
| `schema.properties` | Property detail drawer | `schema[*].properties[*].customProperties` |
| `servers` | Server editor | `servers[*].customProperties` |
| `team` | Team section | `team.customProperties` |
| `team.members` | Team member editor | `team.members[*].customProperties` |
| `roles` | Role editor | `roles[*].customProperties` |
| `support` | Support channel editor | `support[*].customProperties` |

---

## 2. Custom Properties

Add custom properties at a specific scope. Custom properties are grouped into sections for display in the editor UI. Sections are for visual organization only and do not affect how data is stored in the contract.

### Structure

```yaml
<scope>:
  customProperties:
    - section: "section-id"        # UI grouping (display only)
      label: "Section Label"       # Section heading in the editor
      properties:
        - property: "propertyName"
          label: "Property Label"
          type: "text"
```

### Section Positioning

Use `positionAfter` to control where custom sections appear relative to existing sections in the editor:

```yaml
fundamentals:
  customProperties:
    - section: "governance"
      label: "Governance"
      positionAfter: "overview"
      properties: [...]

schema.properties:
  customProperties:
    - section: "privacy"
      label: "Privacy"
      positionAfter: "basics"    # Position within property detail drawer
      properties: [...]
```

Available position IDs vary by scope:

| Scope | Available Position IDs |
|-------|----------------------|
| `fundamentals` | `overview`, `schemas`, `servers`, `team`, `roles`, `support`, `sla`, `pricing`, `custom-properties` |
| `schema` | `metadata`, `quality`, `relationships`, `custom-properties` |
| `schema.properties` | `metadata`, `logical-type-options`, `constraints`, `classification-security`, `transformations`, `data-quality`, `authoritative-definitions`, `relationships`, `custom-properties` |
| `servers` | `metadata`, `connection`, `custom-properties` |
| `team` | `metadata`, `members`, `custom-properties` |
| `roles` | `metadata`, `approvers`, `custom-properties` |
| `support` | `metadata`, `custom-properties` |

If `positionAfter` is omitted, custom sections are added at the end.

---

## 3. Custom Property Definitions

### Property Schema

```yaml
properties:
  - property: "technicalName"       # Technical name (stored in customProperties)
    label: "Display Label"          # Human-readable label
    type: "text"                    # Field type (see Property Types)
    placeholder: "Placeholder text" # Input placeholder
    description: "Help text"        # Description shown as tooltip
    required: true                  # Is field required?
    default: "defaultValue"         # Default value
    enum: []                        # Options for select/multiselect
    pattern: "^[a-z]+$"            # Regex validation pattern
    patternMessage: "Only lowercase" # Custom validation message
    min: 0                          # Minimum (for number types)
    max: 100                        # Maximum (for number types)
    minLength: 1                    # Minimum length (for text)
    maxLength: 255                  # Maximum length (for text)
    condition: "expression"         # Conditional display expression
```

### Property Types

| Type | Description | Additional Options |
|------|-------------|-------------------|
| `text` | Single-line text input | `pattern`, `minLength`, `maxLength` |
| `textarea` | Multi-line text input | `rows`, `minLength`, `maxLength` |
| `number` | Numeric input | `min`, `max`, `step` |
| `integer` | Integer input | `min`, `max` |
| `select` | Single-select dropdown | `enum` (required) |
| `multiselect` | Multi-select dropdown | `enum` (required) |
| `array` | Array of strings | `placeholder`, `minItems`, `maxItems` |
| `boolean` | Toggle/checkbox | - |
| `date` | Date picker | `min`, `max` |
| `datetime` | Date and time picker | `min`, `max` |
| `url` | URL input with validation | `pattern` |
| `email` | Email input with validation | - |

### Enum Definition

For `select` and `multiselect` types:

```yaml
enum:
  - value: "option1"
    label: "Option 1"
  - value: "option2"
    label: "Option 2"
```

### Conditional Display

The `condition` field accepts expressions to conditionally show/hide properties.

Properties can be referenced from any scope:

- **Fundamentals properties**: Use the property name directly (e.g., `status`, `domain`, `dataOwner`)
- **Other scopes**: Use scope prefix with dot notation (e.g., `schema.type`, `schema.properties.piiCategory`)

```yaml
condition: "status == 'active'"
condition: "domain == 'customer'"
condition: "status == 'active' && domain != null"
condition: "tags contains 'gdpr'"
condition: "tenant != null"
```

---

## 4. Customize Standard Properties

Modify the behavior of existing ODCS standard properties, or hide them entirely. Property names are relative to the scope.

### Structure

```yaml
<scope>:
  properties:
    - property: "propertyName"      # Property name (relative to scope)
      label: "New Label"            # Override display label
      description: "New description" # Override help text
      placeholder: "New placeholder" # Override placeholder
      required: true                # Make required
      enum: []                      # Restrict to specific values
      pattern: "regex"              # Add regex validation
      patternMessage: "Error message" # Custom validation message
      default: "value"              # Set default value
      hidden: true                  # Hide from the editor
```

### Available Properties by Scope

#### fundamentals
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

### Hideable Sections (fundamentals scope)

Hide entire sections:

```yaml
fundamentals:
  properties:
    - property: "price"
      hidden: true
    - property: "slaProperties"
      hidden: true
    - property: "support"
      hidden: true
```

---

## 5. Complete Example

```yaml
# customization.yaml

fundamentals:
  customProperties:
    - section: "governance"
      label: "Governance"
      positionAfter: "overview"
      properties:
        - property: "dataOwner"
          label: "Data Owner"
          type: "email"
          required: true
          description: "Person accountable for this data asset"

        - property: "classification"
          label: "Data Classification"
          type: "select"
          required: true
          enum:
            - value: "public"
              label: "Public"
            - value: "internal"
              label: "Internal"
            - value: "confidential"
              label: "Confidential"

        - property: "complianceFrameworks"
          label: "Compliance Frameworks"
          type: "multiselect"
          enum:
            - value: "gdpr"
              label: "GDPR"
            - value: "hipaa"
              label: "HIPAA"
            - value: "sox"
              label: "SOX"

  properties:
    - property: "status"
      enum:
        - value: "draft"
          label: "Draft"
        - value: "in-review"
          label: "In Review"
        - value: "approved"
          label: "Approved"
        - value: "deprecated"
          label: "Deprecated"

    - property: "domain"
      required: true
      enum:
        - value: "customer"
          label: "Customer"
        - value: "product"
          label: "Product"
        - value: "finance"
          label: "Finance"

    - property: "tenant"
      hidden: true

    - property: "price"
      hidden: true

schema:
  customProperties:
    - section: "lifecycle"
      label: "Data Lifecycle"
      properties:
        - property: "retentionDays"
          label: "Retention Period (Days)"
          type: "integer"
          min: 1
          description: "Number of days to retain this data"

        - property: "archivePolicy"
          label: "Archive Policy"
          type: "select"
          enum:
            - value: "delete"
              label: "Delete after retention"
            - value: "archive-cold"
              label: "Move to cold storage"
            - value: "archive-glacier"
              label: "Move to Glacier"

  properties:
    - property: "physicalType"
      enum:
        - value: "table"
          label: "Table"
        - value: "view"
          label: "View"
        - value: "topic"
          label: "Topic"

schema.properties:
  customProperties:
    - section: "privacy"
      label: "Privacy"
      properties:
        - property: "piiCategory"
          label: "PII Category"
          type: "select"
          enum:
            - value: "none"
              label: "None"
            - value: "direct-identifier"
              label: "Direct Identifier"
            - value: "quasi-identifier"
              label: "Quasi Identifier"
            - value: "sensitive"
              label: "Sensitive Data"

        - property: "gdprLegalBasis"
          label: "GDPR Legal Basis"
          type: "select"
          condition: "piiCategory != 'none'"
          enum:
            - value: "consent"
              label: "Consent"
            - value: "contract"
              label: "Contract"
            - value: "legal-obligation"
              label: "Legal Obligation"
            - value: "legitimate-interest"
              label: "Legitimate Interest"

        - property: "maskingRule"
          label: "Masking Rule"
          type: "text"
          placeholder: "e.g., HASH, REDACT, PARTIAL"
          condition: "piiCategory != 'none'"

  properties:
    - property: "classification"
      required: true
      enum:
        - value: "public"
          label: "Public"
        - value: "internal"
          label: "Internal"
        - value: "confidential"
          label: "Confidential"
        - value: "pii"
          label: "PII"

    - property: "encryptedName"
      hidden: true

    - property: "transformLogic"
      hidden: true

    - property: "transformDescription"
      hidden: true

servers:
  customProperties:
    - section: "infrastructure"
      label: "Infrastructure"
      properties:
        - property: "costCenter"
          label: "Cost Center"
          type: "text"
          pattern: "^CC-[0-9]{3,}$"
          patternMessage: "Must be in format CC-XXX"

        - property: "maintenanceWindow"
          label: "Maintenance Window"
          type: "select"
          enum:
            - value: "sun-02-06"
              label: "Sunday 02:00-06:00 UTC"
            - value: "sat-02-06"
              label: "Saturday 02:00-06:00 UTC"

  properties:
    - property: "type"
      enum:
        - value: "snowflake"
          label: "Snowflake"
        - value: "bigquery"
          label: "BigQuery"
        - value: "postgresql"
          label: "PostgreSQL"
        - value: "s3"
          label: "AWS S3"

    - property: "environment"
      enum:
        - value: "dev"
          label: "Development"
        - value: "staging"
          label: "Staging"
        - value: "prod"
          label: "Production"

team:
  customProperties:
    - section: "team-meta"
      label: "Team Metadata"
      properties:
        - property: "slackChannel"
          label: "Slack Channel"
          type: "text"
          placeholder: "#data-team"

        - property: "onCallRotation"
          label: "On-Call Rotation URL"
          type: "url"

team.members:
  customProperties:
    - section: "member-details"
      label: "Member Details"
      properties:
        - property: "department"
          label: "Department"
          type: "text"

        - property: "location"
          label: "Location"
          type: "select"
          enum:
            - value: "us"
              label: "United States"
            - value: "eu"
              label: "Europe"
            - value: "apac"
              label: "Asia Pacific"
```

---



## 7. Loading Customizations

### Programmatic (Recommended)

Pass customizations directly to the `init()` function:

```javascript
import { init } from 'datacontract-editor';

const editor = init({
  selector: '#editor',
  customizations: {
    fundamentals: {
      customProperties: [
        {
          section: "governance",
          label: "Governance",
          positionAfter: "overview",
          properties: [
            {
              property: "dataOwner",
              label: "Data Owner",
              type: "email",
              required: true
            }
          ]
        }
      ],
      properties: [
        {
          property: "status",
          enum: [
            { value: "draft", label: "Draft" },
            { value: "active", label: "Active" }
          ]
        }
      ]
    },
    "schema.properties": {
      customProperties: [
        {
          section: "privacy",
          label: "Privacy",
          properties: [
            {
              property: "piiCategory",
              label: "PII Category",
              type: "select",
              enum: [
                { value: "none", label: "None" },
                { value: "direct", label: "Direct Identifier" }
              ]
            }
          ]
        }
      ]
    }
  }
});
```

---
