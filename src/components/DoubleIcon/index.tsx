type props = {
  size?: number | string;
  className?: string;
};

const DoubleIcon = ({ size = "1em", className }: props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    <line x1="4" y1="8" x2="10" y2="16" />
    <line x1="10" y1="8" x2="4" y2="16" />
    <path d="M14 9.2 A2.6 2.6 0 0 1 18.8 10.5 C18.8 12.4 14.4 13.4 14 16 L19 16" />
  </svg>
);

export default DoubleIcon;
