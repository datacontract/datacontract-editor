// Two key → value rows: a key dot on the left, an arrow to its value on the right.
const MapIcon = ({ className, ...props }) => (
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
    <circle cx="5" cy="8" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="5" cy="16" r="1.5" fill="currentColor" stroke="none" />
    <path d="M10 8h9M16 5l3 3-3 3" />
    <path d="M10 16h9M16 13l3 3-3 3" />
  </svg>
);

export default MapIcon;
