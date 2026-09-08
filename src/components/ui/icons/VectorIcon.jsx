// The mathematical vector: an arrow from the origin, as distinct from the array's bracketed list.
const VectorIcon = ({ className, ...props }) => (
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
    <path d="M5 19L19 5" />
    <path d="M10 5h9v9" />
  </svg>
);

export default VectorIcon;
