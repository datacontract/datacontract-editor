const TimestampIcon = ({ className, ...props }) => (
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
    <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
    <path d="M8 2v4M16 2v4M2 10h20" />
    <circle cx="12" cy="15" r="3" />
    <path d="M12 13v2l1 1" />
  </svg>
);

export default TimestampIcon;
