import { Routes, Route } from 'react-router-dom';
import { useRef } from 'react';
import { YamlEditor, DataContractPreview, TestResultsPanel } from "../components/features/index.js";
import WarningsPanel from "../components/features/WarningsPanel.jsx";
import { Overview, TermsOfUse, Schemas, Schema, Diagram, Pricing, Team, Support, Servers, Server, Roles, ServiceLevelAgreement, CustomProperties } from "../routes/index.js";
import { useEditorStore } from "../store.js";

const MainContent = () => {
  // Hardcoded schema URL for validation
  const schemaUrl = 'https://raw.githubusercontent.com/bitol-io/open-data-contract-standard/refs/heads/dev/schema/odcs-json-schema-v3.1.0.json';

  const yaml = useEditorStore((state) => state.yaml);
  const setYaml = useEditorStore((state) => state.setYaml);
  const isPreviewVisible = useEditorStore((state) => state.isPreviewVisible);
  const isWarningsVisible = useEditorStore((state) => state.isWarningsVisible);
  const isTestResultsVisible = useEditorStore((state) => state.isTestResultsVisible);
  const currentView = useEditorStore((state) => state.currentView);
  const setView = useEditorStore((state) => state.setView);

  // Reference to the YAML editor to call its methods
  const editorRef = useRef(null);

  // Handle marker click - jump to line in editor
  const handleMarkerClick = (lineNumber, column) => {
    // Switch to YAML view first
    setView('yaml');

    // Use setTimeout to ensure the view has switched before trying to reveal the line
    setTimeout(() => {
      if (editorRef.current && editorRef.current.revealLine) {
        editorRef.current.revealLine(lineNumber, column);
      }
    }, 100);
  };

  // Handle test check click - jump to line in editor
  const handleCheckClick = (check) => {
    // Try to extract line number from check object
    let lineNumber = check.line || check.lineNumber;

    // If no direct line property, try to parse from reason or message
    if (!lineNumber && check.reason) {
      const lineMatch = check.reason.match(/line (\d+)/i);
      if (lineMatch) {
        lineNumber = parseInt(lineMatch[1], 10);
      }
    }

    if (lineNumber) {
      // Switch to YAML view first
      setView('yaml');

      // Use setTimeout to ensure the view has switched before trying to reveal the line
      setTimeout(() => {
        if (editorRef.current && editorRef.current.revealLine) {
          editorRef.current.revealLine(lineNumber, 1);
        }
      }, 100);
    }
  };

  // Determine if right pane should be shown
  const isRightPaneVisible = isPreviewVisible || isWarningsVisible || isTestResultsVisible;

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-row w-full h-full">
        <div className={`${isRightPaneVisible ? 'w-1/2' : 'w-full'} h-full border-r border-gray-300`}>
          {/* Always keep YAML editor mounted for validation */}
          <div className={currentView === 'yaml' ? 'h-full' : 'hidden'}>
            <YamlEditor
              ref={editorRef}
              yaml={yaml}
              onChange={setYaml}
              schemaUrl={schemaUrl}
            />
          </div>
          {currentView === 'diagram' && <Diagram />}
          {currentView === 'form' && (
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/overview" element={<Overview />} />
              <Route path="/terms-of-use" element={<TermsOfUse />} />
              <Route path="/schemas" element={<Schemas />} />
              <Route path="/schemas/:schemaId" element={<Schema />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/team" element={<Team />} />
              <Route path="/support" element={<Support />} />
              <Route path="/servers" element={<Servers />} />
              <Route path="/servers/:serverId" element={<Server />} />
              <Route path="/roles" element={<Roles />} />
              <Route path="/sla" element={<ServiceLevelAgreement />} />
              <Route path="/custom-properties" element={<CustomProperties />} />
            </Routes>
          )}
        </div>
        {isPreviewVisible && (
          <div className="w-1/2 h-full p-4 overflow-y-auto overflow-x-hidden bg-gray-50">
            <DataContractPreview yamlContent={yaml} />
          </div>
        )}
        {isWarningsVisible && (
          <div className="w-1/2 h-full border-l border-gray-300">
            <WarningsPanel onMarkerClick={handleMarkerClick} />
          </div>
        )}
        {isTestResultsVisible && (
          <div className="w-1/2 h-full border-l border-gray-300">
            <TestResultsPanel onCheckClick={handleCheckClick} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MainContent;
