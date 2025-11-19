const BooleanIcon = ({ className, ...props }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="8" width="18" height="8" rx="4" />
    <circle cx="16" cy="12" r="2" fill="currentColor" />
  </svg>
);

export default BooleanIcon;
