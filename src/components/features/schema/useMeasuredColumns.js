import {useEffect} from 'react';

// Each property row is its own flex box, so a column can only line up across rows when
// every row uses the same width. Fixed widths wasted space on short names and truncated
// long ones, so the list measures the widest name and type label actually rendered and
// publishes the widths as CSS variables the rows read. A MutationObserver re-measures
// when row text changes (edits, async definition fallbacks, expand/collapse).
const COLUMNS = [
	// name: px-1.5 plus a 1px border each side
	{key: 'name', cssVar: '--prop-name-w', extra: 14, min: 96, max: 384},
	// type: PopoverButton px-2 plus the chevron (w-3.5 + ml-1) that appears on hover
	{key: 'type', cssVar: '--prop-type-w', extra: 34, min: 64, max: 224},
];

export default function useMeasuredColumns(containerRef) {
	useEffect(() => {
		const el = containerRef.current;
		if (!el || typeof MutationObserver === 'undefined') return undefined;
		let frame = 0;
		const measure = () => {
			frame = 0;
			for (const col of COLUMNS) {
				let widest = 0;
				el.querySelectorAll(`[data-measure="${col.key}"]`).forEach((node) => {
					// Inline spans report their full text width even when the parent truncates.
					widest = Math.max(widest, node.getBoundingClientRect().width);
				});
				const width = Math.min(col.max, Math.max(col.min, Math.ceil(widest) + col.extra));
				el.style.setProperty(col.cssVar, `${width}px`);
			}
		};
		const schedule = () => {
			if (!frame) frame = requestAnimationFrame(measure);
		};
		measure();
		// Web fonts arriving after first paint change glyph widths.
		document.fonts?.ready?.then(schedule);
		const observer = new MutationObserver(schedule);
		observer.observe(el, {subtree: true, childList: true, characterData: true});
		return () => {
			observer.disconnect();
			if (frame) cancelAnimationFrame(frame);
		};
	}, [containerRef]);
}
