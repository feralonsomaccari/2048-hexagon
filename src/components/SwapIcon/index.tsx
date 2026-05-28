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
    {/* Two flat-top hexagons, offset like the swap icon */}
    <path d="M6.5 3.2 L9.6 5 V8.6 L6.5 10.4 L3.4 8.6 V5 Z" />
    <path d="M17.5 13.6 L20.6 15.4 V19 L17.5 20.8 L14.4 19 V15.4 Z" />
    {/* Clockwise swap arrows wrapping the pair */}
    <path d="M13 5.2 A6 6 0 0 1 18.5 9.4" />
    <path d="M18.9 6.2 L18.5 9.6 L15.2 9" />
    <path d="M11 18.8 A6 6 0 0 1 5.5 14.6" />
    <path d="M5.1 17.8 L5.5 14.4 L8.8 15" />
  </svg>
);

export default SwapIcon;
