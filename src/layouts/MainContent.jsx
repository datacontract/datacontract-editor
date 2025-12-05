import { Routes, Route } from 'react-router-dom';
import { useRef, useState } from 'react';
import { YamlEditor, DataContractPreview, TestResultsPanel } from "../components/features/index.js";
import WarningsPanel from "../components/features/WarningsPanel.jsx";
import { Overview, TermsOfUse, Schemas, Schema, Diagram, Pricing, Team, Support, Servers, Server, Roles, ServiceLevelAgreement, CustomProperties } from "../routes/index.js";
import { useEditorStore } from "../store.js";
import { PreviewErrorBoundary, DiagramErrorBoundary, FormPageErrorBoundary, ErrorBoundary } from "../components/error/index.js";
import ResizeDivider from "../components/ui/ResizeDivider.jsx";

const MainContent = () => {
  const isPreviewVisible = useEditorStore((state) => state.isPreviewVisible);
  const isWarningsVisible = useEditorStore((state) => state.isWarningsVisible);
  const isTestResultsVisible = useEditorStore((state) => state.isTestResultsVisible);
  const currentView = useEditorStore((state) => state.currentView);
  const setView = useEditorStore((state) => state.setView);

  // Use schema URL from store if provided (e.g., from embed config), otherwise use default
  const schemaUrl = useEditorStore((state) => state.schemaUrl) ||
    'https://raw.githubusercontent.com/bitol-io/open-data-contract-standard/refs/heads/dev/schema/odcs-json-schema-v3.1.0.json';

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

  // State for resizable panel width (percentage of left pane)
  const [leftPanePercent, setLeftPanePercent] = useState(50);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-row w-full h-full">
        <div
          className="h-full"
          style={{ width: isRightPaneVisible ? `${leftPanePercent}%` : '100%' }}
        >
          {/* Always keep YAML editor mounted for validation */}
          <div className={currentView === 'yaml' ? 'h-full' : 'hidden'}>
            <YamlEditor
              ref={editorRef}
              schemaUrl={schemaUrl}
            />
          </div>
          {currentView === 'diagram' && (
            <DiagramErrorBoundary>
              <Diagram />
            </DiagramErrorBoundary>
          )}
          {currentView === 'form' && (
            <Routes>
              <Route path="/" element={
                <FormPageErrorBoundary pageName="Overview">
                  <Overview />
                </FormPageErrorBoundary>
              } />
              <Route path="/overview" element={
                <FormPageErrorBoundary pageName="Overview">
                  <Overview />
                </FormPageErrorBoundary>
              } />
              <Route path="/terms-of-use" element={
                <FormPageErrorBoundary pageName="Terms of Use">
                  <TermsOfUse />
                </FormPageErrorBoundary>
              } />
              <Route path="/schemas" element={
                <FormPageErrorBoundary pageName="Schemas">
                  <Schemas />
                </FormPageErrorBoundary>
              } />
              <Route path="/schemas/:schemaId" element={
                <FormPageErrorBoundary pageName="Schema">
                  <Schema />
                </FormPageErrorBoundary>
              } />
              <Route path="/pricing" element={
                <FormPageErrorBoundary pageName="Pricing">
                  <Pricing />
                </FormPageErrorBoundary>
              } />
              <Route path="/team" element={
                <FormPageErrorBoundary pageName="Team">
                  <Team />
                </FormPageErrorBoundary>
              } />
              <Route path="/support" element={
                <FormPageErrorBoundary pageName="Support">
                  <Support />
                </FormPageErrorBoundary>
              } />
              <Route path="/servers" element={
                <FormPageErrorBoundary pageName="Servers">
                  <Servers />
                </FormPageErrorBoundary>
              } />
              <Route path="/servers/:serverId" element={
                <FormPageErrorBoundary pageName="Server">
                  <Server />
                </FormPageErrorBoundary>
              } />
              <Route path="/roles" element={
                <FormPageErrorBoundary pageName="Roles">
                  <Roles />
                </FormPageErrorBoundary>
              } />
              <Route path="/sla" element={
                <FormPageErrorBoundary pageName="Service Level Agreement">
                  <ServiceLevelAgreement />
                </FormPageErrorBoundary>
              } />
              <Route path="/custom-properties" element={
                <FormPageErrorBoundary pageName="Custom Properties">
                  <CustomProperties />
                </FormPageErrorBoundary>
              } />
              {/* Catch-all route for unmatched paths (e.g., /diagram during view transition) */}
              <Route path="*" element={
                <FormPageErrorBoundary pageName="Overview">
                  <Overview />
                </FormPageErrorBoundary>
              } />
            </Routes>
          )}
        </div>
        {isRightPaneVisible && (
          <ResizeDivider onResize={setLeftPanePercent} />
        )}
        {isPreviewVisible && (
          <div
            className="h-full p-4 overflow-y-auto overflow-x-hidden bg-gray-50"
            style={{ width: `${100 - leftPanePercent}%` }}
          >
            <PreviewErrorBoundary>
              <DataContractPreview />
            </PreviewErrorBoundary>
          </div>
        )}
        {isWarningsVisible && (
          <div
            className="h-full"
            style={{ width: `${100 - leftPanePercent}%` }}
          >
            <ErrorBoundary>
              <WarningsPanel onMarkerClick={handleMarkerClick} />
            </ErrorBoundary>
          </div>
        )}
        {isTestResultsVisible && (
          <div
            className="h-full"
            style={{ width: `${100 - leftPanePercent}%` }}
          >
            <ErrorBoundary>
              <TestResultsPanel onCheckClick={handleCheckClick} />
            </ErrorBoundary>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainContent;
