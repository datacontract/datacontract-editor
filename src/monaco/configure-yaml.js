import * as monaco from 'monaco-editor';
import { configureMonacoYaml } from 'monaco-yaml';

export function setupMonacoYaml() {
    configureMonacoYaml(monaco, {
        enableSchemaRequest: true,
        schemas: [
            {
                // If YAML file is opened matching this glob
                fileMatch: ['**/datacontract.yaml'],
                // And the following URI will be linked to as the source.
                uri: 'https://datacontract.com/datacontract.schema.json'
            },
            {
                // If YAML file is opened matching this glob
                fileMatch: ['**/definition.yaml'],
                // And the following URI will be linked to as the source.
                uri: 'https://datacontract.com/definition.schema.json'
            },
            {
                // If YAML file is opened matching this glob
                fileMatch: ['**/dataproduct.yaml'],
                // And the following URI will be linked to as the source.
                uri: 'https://dataproduct-specification.com/dataproduct.schema.json'
            }
        ]
    })
}