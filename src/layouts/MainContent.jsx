import { Routes, Route } from 'react-router';
import { useRef, useState } from 'react';
import { YamlEditor, DataContractPreview, TestResultsPanel } from "../components/features/index.js";
import WarningsPanel from "../components/features/WarningsPanel.jsx";
import { Overview, TermsOfUse, Schemas, Schema, Diagram, Pricing, Team, Support, Servers, Server, Roles, ServiceLevelAgreement, CustomProperties, Context } from "../routes/index.js";
import { useEditorStore } from "../store.js";
import YamlParseErrorPage from "../components/features/code/YamlParseErrorPage.jsx";
import { PreviewErrorBoundary, DiagramErrorBoundary, FormPageErrorBoundary, ErrorBoundary } from "../components/error/index.js";
import ResizeDivider from "../components/ui/ResizeDivider.jsx";
import { odcsVersionEntryFor, resolveSchemaUrl } from "../services/schemaRegistry.js";

const MainContent = () => {
  const isPreviewVisible = useEditorStore((state) => state.isPreviewVisible);
  const isWarningsVisible = useEditorStore((state) => state.isWarningsVisible);
  const isTestResultsVisible = useEditorStore((state) => state.isTestResultsVisible);
  const currentView = useEditorStore((state) => state.currentView);
  const setView = useEditorStore((state) => state.setView);
  const yamlParseError = useEditorStore((state) => state.yamlParseError);

  // The schema of the document's own ODCS version when the host lists versions, so a v3.1.0
  // document is validated as 3.1.0 even under a 3.2.0 default; otherwise the single configured
  // (or built-in default) schema.
  const odcsVersions = useEditorStore((state) => state.odcsVersions);
  const documentApiVersion = useEditorStore((state) => state.getValue('apiVersion'));
  const configuredSchemaUrl = useEditorStore((state) => state.schemaUrl);
  const schemaUrl = odcsVersions?.length
    ? odcsVersionEntryFor(odcsVersions, documentApiVersion).schema
    : resolveSchemaUrl(configuredSchemaUrl);

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

  // State for resizable panel width (percentage of left pane relative to left+middle)
  const [leftPanePercent, setLeftPanePercent] = useState(50);

  return (
    <div className="flex flex-col w-full h-full min-w-0">
      <div className="flex flex-row w-full h-full min-w-0">
        {/* Left pane - Editor */}
        <div
          className={`h-full overflow-auto ${isRightPaneVisible ? 'max-lg:!w-full' : 'w-full'}`}
          style={isRightPaneVisible ? { width: `${leftPanePercent}%` } : {}}
          >
            {/* Always keep YAML editor mounted for validation */}
            <div className={currentView === 'yaml' ? 'h-full' : 'hidden'}>
              <YamlEditor
                ref={editorRef}
                schemaUrl={schemaUrl}
              />
            </div>
            {currentView === 'diagram' && (
              yamlParseError ? (
                <YamlParseErrorPage onSwitchToYaml={() => {
                  setView('yaml');
                  const pos = useEditorStore.getState().yamlParseErrorPos;
                  if (pos) useEditorStore.setState({ pendingScrollToPos: pos });
                }} />
              ) : (
                <DiagramErrorBoundary>
                  <Diagram />
                </DiagramErrorBoundary>
              )
            )}
            {currentView === 'form' && (
              yamlParseError ? (
                <YamlParseErrorPage onSwitchToYaml={() => {
                  setView('yaml');
                  const pos = useEditorStore.getState().yamlParseErrorPos;
                  if (pos) useEditorStore.setState({ pendingScrollToPos: pos });
                }} />
              ) : (
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
                <Route path="/context" element={
                  <FormPageErrorBoundary pageName="Context">
                    <Context />
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
              )
            )}
          </div>

        {/* Resize divider between left and right panes */}
        {isRightPaneVisible && (
          <ResizeDivider onResize={setLeftPanePercent} />
        )}

        {/* Right pane - Preview/Warnings/Tests (mutually exclusive) */}
        {isPreviewVisible && (
          <div
            className="hidden md:block h-full p-4 overflow-y-auto overflow-x-hidden bg-gray-50"
            style={{ width: `${100 - leftPanePercent}%` }}
          >
            <PreviewErrorBoundary>
              <DataContractPreview />
            </PreviewErrorBoundary>
          </div>
        )}
        {isWarningsVisible && (
          <div
            className="hidden md:block h-full"
            style={{ width: `${100 - leftPanePercent}%` }}
          >
            <ErrorBoundary>
              <WarningsPanel onMarkerClick={handleMarkerClick} />
            </ErrorBoundary>
          </div>
        )}
        {isTestResultsVisible && (
          <div
            className="hidden md:block h-full"
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
