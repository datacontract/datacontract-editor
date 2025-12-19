import {useCallback} from 'react';
import {useEditorStore} from '../../../store.js';
import {useShallow} from "zustand/react/shallow";
import {buildPropertyPath, buildPropertiesArrayPath} from '../../../utils/schemaPathBuilder.js';

/**
 * Custom hook for schema CRUD operations
 * Centralizes all schema manipulation logic
 */
export function useSchemaOperations(schemaIndex) {
    const getValue = useEditorStore(useShallow((state) => state.getValue));
    const setValue = useEditorStore(useShallow((state) => state.setValue));
    const schema = useEditorStore(useShallow((state) => state.getValue('schema')));

    // Remove entire schema
    const removeSchema = useCallback(() => {
        try {
            const newSchemaList = schema.filter((_, idx) => idx !== schemaIndex);
            setValue('schema', newSchemaList);
        } catch (error) {
            console.error('Error removing schema:', error);
        }
    }, [schema, schemaIndex, setValue]);

    // Add property to schema's top-level properties
    const addProperty = useCallback(() => {
        try {
            if (!schema || !schema[schemaIndex]) {
                console.warn(`Schema at index ${schemaIndex} not found`);
                return;
            }

            const currentProperties = schema[schemaIndex].properties || [];
            const newProperties = [...currentProperties, {
                name: '',
                logicalType: '',
                description: ''
            }];

            setValue(`schema[${schemaIndex}].properties`, newProperties);
        } catch (error) {
            console.error('Error adding property:', error);
        }
    }, [schema, schemaIndex, setValue]);

    // Save current property and add next one (for Enter key on last property)
    const handleSaveAndAddNext = useCallback((schemaIdx, propPath, newName) => {
        try {
            if (!schema || !schema[schemaIndex]) {
                return;
            }

            const currentProperties = schema[schemaIndex].properties || [];
            const propIndex = propPath[propPath.length - 1];

            // Update the current property name
            if (typeof propIndex === 'number' && currentProperties[propIndex]) {
                setValue(`schema[${schemaIndex}].properties[${propIndex}].name`, newName?.trim() || '');
            }

            // Add the new property
            const newProperties = [...currentProperties, {
                name: '',
                logicalType: '',
                description: ''
            }];
            setValue(`schema[${schemaIndex}].properties`, newProperties);

            // Return the new property index for auto-edit
            return newProperties.length - 1;
        } catch (error) {
            console.error('Error saving and adding next property:', error);
        }
    }, [schema, schemaIndex, setValue]);

    // Update property field (supports nested properties via propPath)
    const updateProperty = useCallback((schemaIdx, propPath, field, value) => {
        try {
            if (!schema || !schema[schemaIndex]) {
                return;
            }

            const pathStr = buildPropertyPath(schemaIndex, propPath, field);
            setValue(pathStr, value);

            // Auto-initialize items object when logicalType is set to 'array'
            if (field === 'logicalType' && value === 'array') {
                const itemsPath = buildPropertyPath(schemaIndex, propPath, 'items');
                const currentItems = getValue(itemsPath);
                // Only initialize if items doesn't exist
                if (!currentItems) {
                    setValue(itemsPath, {
                        logicalType: 'string'
                    });
                }
            }

            // Remove items when logicalType is changed from 'array' to something else
            if (field === 'logicalType' && value !== 'array') {
                const itemsPath = buildPropertyPath(schemaIndex, propPath, 'items');
                const currentItems = getValue(itemsPath);
                if (currentItems) {
                    setValue(itemsPath, undefined);
                }
            }
        } catch (error) {
            console.error('Error updating property:', error);
        }
    }, [schema, schemaIndex, setValue, getValue]);

    // Remove property from schema
    const removeProperty = useCallback((schemaIdx, propIdx) => {
        try {
            if (!schema || !schema[schemaIdx] || !schema[schemaIdx].properties) {
                return;
            }

            const currentProperties = schema[schemaIdx].properties;
            if (!currentProperties[propIdx]) {
                return;
            }

            const newProperties = currentProperties.filter((_, idx) => idx !== propIdx);
            setValue(`schema[${schemaIdx}].properties`, newProperties);
        } catch (error) {
            console.error('Error removing property:', error);
        }
    }, [schema, setValue]);

    // Add sub-property to a property (for nested objects or items)
    const addSubProperty = useCallback((schemaIdx, propPath, isItems = false) => {
        try {
            if (!schema || !schema[schemaIndex]) {
                console.warn(`Schema at index ${schemaIndex} not found`);
                return;
            }

            const pathStr = buildPropertiesArrayPath(schemaIndex, propPath, isItems);

            // Get current properties array or initialize empty
            const currentProperties = getValue(pathStr) || [];
            const newProperties = [...currentProperties, {
                name: '',
                logicalType: '',
                description: ''
            }];

            setValue(pathStr, newProperties);
        } catch (error) {
            console.error('Error adding sub-property:', error);
        }
    }, [schema, schemaIndex, getValue, setValue]);

    // Reorder property within same parent (drag-and-drop)
    const reorderProperty = useCallback((propPath, fromIndex, toIndex) => {
        try {
            if (!schema || !schema[schemaIndex]) {
                return;
            }
            if (fromIndex === toIndex) {
                return;
            }

            // Build path to the properties array containing the items to reorder
            // propPath is the path to the parent, empty for top-level properties
            let pathStr;
            if (propPath.length === 0) {
                // Top-level properties
                pathStr = `schema[${schemaIndex}].properties`;
            } else {
                // Nested properties - use the path builder
                pathStr = buildPropertiesArrayPath(schemaIndex, propPath.slice(0, -1), propPath[propPath.length - 1] === 'items');
            }

            const currentProperties = getValue(pathStr);
            if (!Array.isArray(currentProperties)) {
                return;
            }

            // Perform reorder
            const reordered = [...currentProperties];
            const [removed] = reordered.splice(fromIndex, 1);
            reordered.splice(toIndex, 0, removed);

            setValue(pathStr, reordered);
        } catch (error) {
            console.error('Error reordering property:', error);
        }
    }, [schema, schemaIndex, getValue, setValue]);

    return {
        schema,
        getValue,
        setValue,
        removeSchema,
        addProperty,
        handleSaveAndAddNext,
        updateProperty,
        removeProperty,
        addSubProperty,
        reorderProperty
    };
}
