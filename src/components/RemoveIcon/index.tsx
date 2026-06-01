type props = {
  size?: number | string;
  className?: string;
};

const RemoveIcon = ({ size = "1em", className }: props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M12 3 H16.5 A2 2 0 0 1 18.2 4 L21.4 9.6 A2 2 0 0 1 21.4 11.6 L18.2 17.2 A2 2 0 0 1 16.5 18.2 H12 L13.6 10.6 Z"
      style={{ transformBox: "fill-box", transformOrigin: "center", transform: "translate(1.4px, -1.4px) rotate(10deg)" }}
    />
    <path
      d="M12 21 H7.5 A2 2 0 0 1 5.8 20 L2.6 14.4 A2 2 0 0 1 2.6 12.4 L5.8 6.8 A2 2 0 0 1 7.5 5.8 H12 L10.4 13.4 Z"
      style={{ transformBox: "fill-box", transformOrigin: "center", transform: "translate(-1.4px, 1.4px) rotate(-10deg)" }}
    />
  </svg>
);

export default RemoveIcon;
