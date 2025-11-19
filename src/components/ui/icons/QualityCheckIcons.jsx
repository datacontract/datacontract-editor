// Quality Check Type Icons

export const TextCheckIcon = ({ className = "w-3 h-3" }) => (
  <svg className={className} viewBox="0 0 16 16" fill="currentColor">
    <path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm2 1v8h8V4H4zm1 2h6v1H5V6zm0 2h6v1H5V8z"/>
  </svg>
);

export const SqlCheckIcon = ({ className = "w-3 h-3" }) => (
  <svg className={className} viewBox="0 0 16 16" fill="currentColor">
    <path d="M3 2a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V3a1 1 0 00-1-1H3zm1 2h8v1H4V4zm0 2h8v1H4V6zm0 2h5v1H4V8zm0 2h6v1H4v-1z"/>
    <path d="M7 12l1-1 1 1 1-1v2H7v-2z" opacity="0.6"/>
  </svg>
);

export const LibraryCheckIcon = ({ className = "w-3 h-3" }) => (
  <svg className={className} viewBox="0 0 16 16" fill="currentColor">
    <path d="M3 2v12l3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2-3-2zm2 3h6v1H5V5zm0 2h6v1H5V7zm0 2h4v1H5V9z"/>
  </svg>
);

export const CustomCheckIcon = ({ className = "w-3 h-3" }) => (
  <svg className={className} viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 2l1.5 3h3.5l-2.5 2 1 3.5L8 9l-3.5 1.5 1-3.5-2.5-2h3.5L8 2z"/>
  </svg>
);

export const getQualityCheckIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'text':
      return TextCheckIcon;
    case 'sql':
      return SqlCheckIcon;
    case 'library':
      return LibraryCheckIcon;
    case 'custom':
      return CustomCheckIcon;
    default:
      return LibraryCheckIcon;
  }
};
