import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import { useEditorStore } from '../store';
import yaml from 'js-yaml';

// This function reads YAML and generates PDF based on the data contract structure. It uses jsPDF for PDF generation and autoTable for tables.
async function exportYamlToPdf() {
    const pdf = new jsPDF("p", "mm", "a4");

    const state = useEditorStore.getState();

    let dataContract = null;

    if (state.yaml) {
        try {
            dataContract = yaml.load(state.yaml);
        } catch (e) {
            console.error("Failed to parse YAML:", e);
            alert("Failed to parse YAML content. Please check your data contract format.");
            return;
        }
    }

    console.log("Parsed data contract:", dataContract);

    if (!dataContract || typeof dataContract !== 'object') {
        alert("No data contract found. Please load or create a data contract first.");
        return;
    }

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (2 * margin);
    let yPosition = margin;

    // Helper function to add text with word wrap
    const addText = (text, fontSize = 11, isBold = false) => {
        if (!text || text === 'undefined' || text === 'null') return;

        pdf.setFontSize(fontSize);
        pdf.setFont("helvetica", isBold ? "bold" : "normal");
        const lines = pdf.splitTextToSize(String(text), contentWidth);
        pdf.text(lines, margin, yPosition);
        yPosition += (lines.length * fontSize * 0.35) + 5;
    };

    // Helper function to add a horizontal line separator
    const addSeparatorLine = () => {
        checkPageBreak(10);
        pdf.setDrawColor(209, 213, 219); // Light gray color
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;
    };

    // Helper function to add a smaller horizontal line separator (for within sections)
    const addSmallSeparatorLine = () => {
        checkPageBreak(8);
        pdf.setDrawColor(229, 231, 235); // Lighter gray color
        pdf.setLineWidth(0.3);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
    };

    // Helper function to check if we need a new page
    const checkPageBreak = (requiredSpace = 20) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
        }
    };

    // === HEADER SECTION ===

    // Title
    const title = dataContract.name || dataContract.id || "Data Contract";
    addText(title, 20, true);
    yPosition += 2;

    // Version and Status
    if (dataContract.version || dataContract.status) {
        const versionStatus = [
            dataContract.version ? `Version: ${dataContract.version}` : null,
            dataContract.status ? `Status: ${dataContract.status}` : null
        ].filter(Boolean).join(' | ');
        addText(versionStatus, 9);
        yPosition += 3;
    }

    addSeparatorLine();

    // === FUNDAMENTALS SECTION ===

    // ID
    if (dataContract.id) {
        checkPageBreak(15);
        addText("ID", 12, true);
        addText(dataContract.id, 10);
        yPosition += 1;
        addSmallSeparatorLine();
    }

    // Tenant
    if (dataContract.tenant) {
        checkPageBreak(15);
        addText("Tenant", 12, true);
        addText(dataContract.tenant, 10);
        yPosition += 1;
        addSmallSeparatorLine();
    }

    // Domain
    if (dataContract.domain) {
        checkPageBreak(15);
        addText("Domain", 12, true);
        addText(dataContract.domain, 10);
        yPosition += 1;
        addSmallSeparatorLine();
    }

    // Team
    if (dataContract.team) {
        checkPageBreak(25);
        addText("Team", 12, true);
        if (dataContract.team.name) addText(dataContract.team.name, 10, true);
        if (dataContract.team.description) addText(dataContract.team.description, 10);
        yPosition += 1;
        addSmallSeparatorLine();
    }

    // Tags
    if (dataContract.tags && Array.isArray(dataContract.tags) && dataContract.tags.length > 0) {
        checkPageBreak(15);
        addText("Tags", 12, true);
        addText(dataContract.tags.join(', '), 10);
        yPosition += 1;
    }

    addSeparatorLine();

    // === TERMS OF USE SECTION ===

    if (dataContract.description) {
        checkPageBreak(40);
        addText("Terms of Use", 14, true);
        yPosition += 2;

        if (typeof dataContract.description === 'string') {
            addText(dataContract.description, 10);
        } else if (typeof dataContract.description === 'object') {
            if (dataContract.description.purpose) {
                addText("Purpose", 11, true);
                addText(dataContract.description.purpose, 10);
                yPosition += 2;
            }
            if (dataContract.description.usage) {
                checkPageBreak(30);
                addText("Usage", 11, true);
                addText(dataContract.description.usage, 10);
                yPosition += 2;
            }
            if (dataContract.description.limitations) {
                checkPageBreak(30);
                addText("Limitations", 11, true);
                addText(dataContract.description.limitations, 10);
                yPosition += 2;
            }
        }
        yPosition += 3;
        addSeparatorLine();
    }

    // === SERVERS SECTION ===

    if (dataContract.servers && Array.isArray(dataContract.servers) && dataContract.servers.length > 0) {
        checkPageBreak(40);
        addText("Servers", 14, true);
        yPosition += 3;

        dataContract.servers.forEach((server) => {
            checkPageBreak(30);
            if (server.server) addText(`• ${server.server}`, 11, true);
            if (server.type) addText(`  Type: ${server.type}`, 10);
            if (server.environment) addText(`  Environment: ${server.environment}`, 10);
            if (server.project) addText(`  Project: ${server.project}`, 10);
            if (server.dataset) addText(`  Dataset: ${server.dataset}`, 10);
            if (server.description) addText(`  Description: ${server.description}`, 10);
            yPosition += 2;
        });
        yPosition += 5;
        addSeparatorLine();
    }

    // === SUPPORT SECTION ===

    if (dataContract.support && Array.isArray(dataContract.support) && dataContract.support.length > 0) {
        checkPageBreak(40);
        addText("Support", 14, true);
        yPosition += 3;

        dataContract.support.forEach((sup) => {
            checkPageBreak(25);
            if (sup.channel) addText(`Channel: ${sup.channel}`, 10, true);
            if (sup.url) addText(`URL: ${sup.url}`, 10);
            if (sup.description) addText(`Description: ${sup.description}`, 10);
            yPosition += 2;
        });
        yPosition += 5;
        addSeparatorLine();
    }

    // === ROLES SECTION ===

    if (dataContract.roles && Array.isArray(dataContract.roles) && dataContract.roles.length > 0) {
        checkPageBreak(40);
        addText("Roles", 14, true);
        yPosition += 3;

        dataContract.roles.forEach((role) => {
            checkPageBreak(30);
            if (role.role) addText(`• ${role.role}`, 11, true);
            if (role.access) addText(`  Access: ${role.access}`, 10);
            if (role.description) addText(`  Description: ${role.description}`, 10);
            if (role.firstLevelApprovers) addText(`  First Level Approvers: ${role.firstLevelApprovers}`, 10);
            if (role.secondLevelApprovers) addText(`  Second Level Approvers: ${role.secondLevelApprovers}`, 10);
            yPosition += 2;
        });
        yPosition += 5;
        addSeparatorLine();
    }

    // === PRICING SECTION ===

    if (dataContract.price) {
        checkPageBreak(30);
        addText("Pricing", 14, true);
        if (dataContract.price.priceAmount !== undefined) {
            const amount = dataContract.price.priceAmount;
            const currency = dataContract.price.priceCurrency || '';
            addText(`Price: ${amount} ${currency}`.trim(), 10);
        }
        if (dataContract.price.priceUnit) addText(`Unit: ${dataContract.price.priceUnit}`, 10);
        yPosition += 5;
        addSeparatorLine();
    }

    // === SLA PROPERTIES SECTION ===

    if (dataContract.slaProperties && Array.isArray(dataContract.slaProperties) && dataContract.slaProperties.length > 0) {
        checkPageBreak(40);
        addText("Service Level Agreement", 14, true);
        yPosition += 3;

        dataContract.slaProperties.forEach((sla) => {
            checkPageBreak(30);
            if (sla.property) addText(`• ${sla.property}`, 11, true);
            if (sla.value !== undefined && sla.unit) {
                addText(`  Value: ${sla.value} ${sla.unit}`, 10);
            }
            if (sla.description) addText(`  ${sla.description}`, 10);
            yPosition += 2;
        });
        yPosition += 5;
        addSeparatorLine();
    }

    // === QUALITY SECTION ===

    if (dataContract.quality) {
        checkPageBreak(40);
        addText("Quality", 14, true);
        if (dataContract.quality.type) addText(`Type: ${dataContract.quality.type}`, 10);
        if (dataContract.quality.specification) addText(`Specification: ${dataContract.quality.specification}`, 10);
        yPosition += 5;
        addSeparatorLine();
    }

    // === TERMS SECTION ===

    if (dataContract.terms) {
        checkPageBreak(40);
        addText("Terms & Conditions", 14, true);

        if (dataContract.terms.usage) addText(`Usage: ${dataContract.terms.usage}`, 10);
        if (dataContract.terms.limitations) addText(`Limitations: ${dataContract.terms.limitations}`, 10);
        if (dataContract.terms.billing) addText(`Billing: ${dataContract.terms.billing}`, 10);
        if (dataContract.terms.noticePeriod) addText(`Notice Period: ${dataContract.terms.noticePeriod}`, 10);
        yPosition += 5;
        // No separator before Data Model since it starts on a new page
    }

    // === DATA MODEL SECTION (MOVED TO END) ===
    // Always start Data Model on a new page

    const schemas = dataContract.schema || dataContract.models;
    if (schemas && Array.isArray(schemas) && schemas.length > 0) {
        // Force new page for Data Model section
        pdf.addPage();
        yPosition = margin;

        addText("Data Model", 14, true);
        yPosition += 5;

        schemas.forEach((schema, schemaIndex) => {
            // Start each schema on a new page (except the first one)
            if (schemaIndex > 0) {
                pdf.addPage();
                yPosition = margin;
            }

            // Schema name
            const schemaName = schema.name || schema.businessName || "Unnamed Schema";
            addText(schemaName, 12, true);

            // Schema description
            if (schema.description) {
                addText(schema.description, 10);
                yPosition += 3;
            }

            // Properties table
            if (schema.properties && Array.isArray(schema.properties) && schema.properties.length > 0) {
                const tableData = schema.properties.map((prop) => {
                    const name = prop.name || '-';
                    const type = prop.logicalType || prop.type || prop.dataType || '-';
                    const description = prop.description || '-';
                    return [name, type, description];
                });

                checkPageBreak(60);

                autoTable(pdf, {
                    startY: yPosition,
                    head: [["Property", "Type", "Description"]],
                    body: tableData,
                    margin: { left: margin, right: margin },
                    styles: {
                        fontSize: 9,
                        cellPadding: 4,
                        lineColor: [209, 213, 219],
                        lineWidth: 0.1
                    },
                    headStyles: {
                        fillColor: [243, 244, 246],
                        textColor: [17, 24, 39],
                        fontStyle: "bold",
                        lineWidth: 0.1,
                        lineColor: [209, 213, 219]
                    },
                    alternateRowStyles: {
                        fillColor: [249, 250, 251]
                    },
                    columnStyles: {
                        0: { cellWidth: 50 },
                        1: { cellWidth: 30 },
                        2: { cellWidth: contentWidth - 80 }
                    }
                });

                yPosition = pdf.lastAutoTable.finalY + 10;
            }
        });
    }

    const filename = dataContract.id ? `${dataContract.id}` : "data-contract";
    const version = dataContract.version ? `version-${dataContract.version}.pdf` : "version_00.pdf";
    const fullFilename = `${filename}-${version}`;

    // Try modern File System Access API first (like YAML export does)
    if ('showSaveFilePicker' in window) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: fullFilename,
                types: [{
                    description: 'PDF Files',
                    accept: { 'application/pdf': ['.pdf'] }
                }]
            });
            const writable = await handle.createWritable();
            await writable.write(pdf.output('blob'));
            await writable.close();
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Save failed:', err);
                // Fallback to automatic download
                pdf.save(fullFilename);
            }
        }
    } else {
        // Fallback for older browsers
        pdf.save(fullFilename);
    }
}

export default exportYamlToPdf;

