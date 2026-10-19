import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEditorStore } from '../../store.js';
import SemanticsBrowsePanel from './SemanticsBrowsePanel.jsx';
import DataProductsBrowsePanel from './DataProductsBrowsePanel.jsx';
import AssetsBrowsePanel from './AssetsBrowsePanel.jsx';
import { useBrowseVisible } from './useBrowseVisible.js';
import { useCurrentSchemaIndex } from './useCurrentSchemaIndex.js';
import { PanelHint } from './browsePanelParts.jsx';

const DEFAULT_WIDTH = 320;
const MIN_WIDTH = 240;
const MAX_WIDTH = 560;

const XIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

/**
 * Resizable panel next to the edge tab with one internal tab per configured
 * browse source (semantics / upstream data products / server assets). With a single source
 * configured the tab bar collapses to a plain title.
 *
 * The data-browse-panel attribute is load-bearing: SchemaEditor's
 * outside-click handler keeps the property drawer open for clicks (and drag
 * starts) inside this panel.
 */
export default function BrowsePanel() {
  const { t } = useTranslation();
  const editorConfig = useEditorStore((state) => state.editorConfig);
  const isOpen = useEditorStore((state) => state.isBrowsePanelOpen);
  const closeBrowsePanel = useEditorStore((state) => state.closeBrowsePanel);
  const browsePanelTab = useEditorStore((state) => state.browsePanelTab);
  const setBrowsePanelTab = useEditorStore((state) => state.setBrowsePanelTab);
  const isDiagram = useEditorStore((state) => state.currentView) === 'diagram';
  const isVisible = useBrowseVisible();
  const canAdd = useCurrentSchemaIndex() != null;

  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const panelLeftRef = useRef(0);
  const panelRef = useRef(null);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    panelLeftRef.current = panelRef.current?.getBoundingClientRect().left ?? 0;
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return;
    const newWidth = e.clientX - panelLeftRef.current;
    setWidth(Math.min(Math.max(newWidth, MIN_WIDTH), MAX_WIDTH));
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const sources = [];
  if (editorConfig?.semantics?.baseUrl) sources.push('semantics');
  if (editorConfig?.dataProducts?.upstreamUrl || editorConfig?.dataProducts?.productsUrl) sources.push('dataProducts');
  if (editorConfig?.assets?.url) sources.push('assets');

  if (!isVisible || !isOpen || sources.length === 0) return null;

  const activeTab = sources.includes(browsePanelTab) ? browsePanelTab : sources[0];

  return (
    <div className="hidden md:flex h-full flex-shrink-0 relative" data-browse-panel ref={panelRef}>
      <div style={{ width: `${width}px` }} className="h-full flex flex-col bg-white">
        {/* Header: source tabs (or a plain title for a single source) + close */}
        <div className="flex items-center justify-between border-b border-gray-200 pr-2">
          {sources.length > 1 ? (
            <div className="flex">
              {sources.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setBrowsePanelTab(key)}
                  className={`px-3 py-2 text-sm font-medium border-b-2 ${activeTab === key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  {t(`browsePanel.${key}.title`)}
                </button>
              ))}
            </div>
          ) : (
            <h2 className="px-3 py-2 text-sm font-semibold text-gray-900">
              {t(`browsePanel.${activeTab}.title`)}
            </h2>
          )}
          <button
            type="button"
            onClick={closeBrowsePanel}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title={t('browsePanel.close')}
          >
            <span className="sr-only">{t('browsePanel.close')}</span>
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden min-h-0">
          {activeTab === 'semantics' && <SemanticsBrowsePanel />}
          {activeTab === 'dataProducts' && <DataProductsBrowsePanel />}
          {activeTab === 'assets' && <AssetsBrowsePanel />}
        </div>

        {/* Usage hint, pinned at the bottom of the panel */}
        <PanelHint text={
          isDiagram
            ? t('browsePanel.dragToSchemaHint')
            : canAdd
              ? t('browsePanel.formHint')
              : t('browsePanel.openSchemaHint')
        } />
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className="relative flex-shrink-0 cursor-col-resize w-px h-full bg-gray-300 hover:bg-blue-400 transition-colors"
        title={t('common.dragToResize')}
      >
        <div className="absolute inset-y-0 -left-1 -right-1" />
      </div>

      {/* Floating collapse chevron on the panel's outer edge (counterpart of BrowseEdgeTab) */}
      <button
        type="button"
        onClick={closeBrowsePanel}
        title={t('browsePanel.collapse')}
        aria-expanded={true}
        className="absolute top-1/2 -translate-y-1/2 -right-3 z-20 h-6 w-6 rounded-full border border-gray-300 bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:border-indigo-400 transition-colors"
      >
        <span className="sr-only">{t('browsePanel.collapse')}</span>
        <svg className="size-4 rotate-180" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}
