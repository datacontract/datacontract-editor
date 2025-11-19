const CheckCircleIcon = ({ className, ...props }) => (
  <svg 
    className={className} 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor"
    {...props}
  >
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.73 10.067a.75.75 0 00-1.06 1.061l2.25 2.25a.75.75 0 001.137-.089l3.75-5.25z" clipRule="evenodd" />
  </svg>
);

export default CheckCircleIcon;