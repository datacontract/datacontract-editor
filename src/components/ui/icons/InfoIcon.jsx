const InfoIcon = ({ className = "w-3 h-3" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={className}
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" />
    <circle cx="12" cy="8" r="1.4" fill="#fff" />
    <rect x="10.6" y="10.6" width="2.8" height="7" rx="1.4" fill="#fff" />
  </svg>
);

export default InfoIcon;
