import {IconResolver} from './IconResolver.jsx';
import Tooltip from './Tooltip.jsx';
import LinkIcon from './icons/LinkIcon.jsx';
import { toAbsoluteUrl } from '../../lib/urlUtils.js';

/**
 * AuthoritativeDefinitionsPreview component for displaying authoritative definitions
 * A compact, icon-only preview component with tooltips
 *
 * @param {Array} definitions - Array of authoritative definition objects with {type, url, description}
 * @param {string} size - Icon size class (default: 'w-4 h-4')
 */
const AuthoritativeDefinitionsPreview = ({definitions = [], size = 'w-4 h-4'}) => {
	if (!definitions || definitions.length === 0) {
		return null;
	}

	return (
		<div className="flex flex-wrap gap-1">
			{definitions.map((def, index) => {
				const absoluteUrl = toAbsoluteUrl(def.url);

				const tooltipContent = (
					<div className="text-xs">
						<div className="font-medium mb-0.5">{def.type}</div>
						{def.description && <div className="text-gray-300 mb-0.5">{def.description}</div>}
						{absoluteUrl && (
							<div className="flex items-start gap-1 text-gray-400 text-[10px]">
								<LinkIcon className="w-2.5 h-2.5 flex-shrink-0 mt-0.5" />
								<span className="break-all">{absoluteUrl}</span>
							</div>
						)}
					</div>
				);

				return (
					<Tooltip key={index} content={tooltipContent}>
						<a
							href={absoluteUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="cursor-pointer rounded bg-white p-1 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:ring-indigo-300 hover:text-gray-700 transition-colors"
						>
							<div className={size}>
								<IconResolver url={absoluteUrl} type={def.type} className="w-full h-full"/>
							</div>
						</a>
					</Tooltip>
				);
			})}
		</div>
	);
};

export default AuthoritativeDefinitionsPreview;
