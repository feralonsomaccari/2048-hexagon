type props = {
  /** Pixel size of the (square) icon. Defaults to 1em so it scales with text. */
  size?: number | string;
  className?: string;
};

// "Undo" arrow, traced from return-icon.png. Uses `fill: currentColor` so it
// inherits the surrounding text color and matches the button label in both the
// light and dark themes.
const UndoIcon = ({ size = "1em", className }: props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 512 512"
    fill="currentColor"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    <path d="M 101.6 161.1 c -55 44.8 -100.1 82 -100.3 82.6 -0.3 0.8 197.3 163.1 199.9 164.1 0.4 0.2 0.8 -21.3 0.8 -47.8 l 0 -48.2 17.8 0.6 c 127.6 4.8 209.3 35.6 276.1 104.1 7.7 8 14.1 13.9 14.1 13.2 0 -0.8 -1.8 -7.4 -3.9 -14.8 -39.4 -134.4 -140.3 -218.1 -288.1 -239.4 -6.3 -0.9 -12.5 -1.8 -13.7 -2.1 l -2.3 -0.4 -0.2 -46.8 -0.3 -46.7 -99.9 81.6 z" />
  </svg>
);

export default UndoIcon;
