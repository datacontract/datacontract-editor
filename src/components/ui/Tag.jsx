import { memo } from 'react';

const Tag = memo(({children, className = ""}) => (
	<span
		className={`inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 ${className}`}>
		<svg className="size-1.5 fill-gray-500 mr-1" viewBox="0 0 6 6" aria-hidden="true">
			<circle cx="3" cy="3" r="3"></circle>
		</svg>
		{children}
	</span>
));

Tag.displayName = 'Tag';

export default Tag;
