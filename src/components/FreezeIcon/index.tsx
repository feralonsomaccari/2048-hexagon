type props = {
  size?: number | string;
  className?: string;
};

const FreezeIcon = ({ size = "1em", className }: props) => (
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
    <line x1="12" y1="2.5" x2="12" y2="21.5" />
    <line x1="3.77" y1="7.25" x2="20.23" y2="16.75" />
    <line x1="3.77" y1="16.75" x2="20.23" y2="7.25" />
    <path d="M12 2.5 L9.6 5 M12 2.5 L14.4 5" />
    <path d="M12 21.5 L9.6 19 M12 21.5 L14.4 19" />
    <path d="M3.77 7.25 L3.55 10.05 M3.77 7.25 L6.5 6.7" />
    <path d="M20.23 16.75 L20.45 13.95 M20.23 16.75 L17.5 17.3" />
    <path d="M3.77 16.75 L6.5 17.3 M3.77 16.75 L3.55 13.95" />
    <path d="M20.23 7.25 L17.5 6.7 M20.23 7.25 L20.45 10.05" />
  </svg>
);

export default FreezeIcon;
