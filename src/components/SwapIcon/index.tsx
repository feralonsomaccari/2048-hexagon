type props = {
  size?: number | string;
  className?: string;
};

const SwapIcon = ({ size = "1em", className }: props) => (
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
    <path d="M4.9 2.86 L9.1 2.86 L11.2 6.5 L9.1 10.14 L4.9 10.14 L2.8 6.5 Z" />
    <path d="M14.9 13.86 L19.1 13.86 L21.2 17.5 L19.1 21.14 L14.9 21.14 L12.8 17.5 Z" />
    <path d="M13.4 5 A6.2 6.2 0 0 1 19 9.6" />
    <path d="M19.6 6.2 L19.1 9.8 L15.6 9.2" />
    <path d="M10.6 19 A6.2 6.2 0 0 1 5 14.4" />
    <path d="M4.4 17.8 L4.9 14.2 L8.4 14.8" />
  </svg>
);

export default SwapIcon;
