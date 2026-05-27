type props = {
  /** Pixel size of the (square) icon. Defaults to 1em so it scales with text. */
  size?: number | string;
  className?: string;
};

// Speaker-with-waves (sound on) icon, cropped and traced from soundicon.png.
// Uses `fill: currentColor` so it matches its label color in both themes, like
// the other icons. Keeps potrace's flip/scale transform.
const UnmuteIcon = ({ size = "1em", className }: props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 95 77"
    fill="currentColor"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    <g transform="translate(0,77) scale(0.1,-0.1)">
      <path d="M310 645 l-115 -115 -92 0 -93 0 0 -145 0 -145 93 0 92 0 115 -115 c63 -63 118 -115 122 -115 5 0 8 169 8 375 0 206 -3 375 -8 375 -4 0 -59 -52 -122 -115z m20 -257 l0 -132 -43 42 c-42 41 -44 42 -110 42 l-67 0 0 45 0 45 63 0 c61 0 64 1 107 45 24 25 45 45 47 45 2 0 3 -59 3 -132z M803 691 c-20 -17 -21 -20 -7 -40 93 -132 94 -380 2 -529 l-20 -32 24 -20 c27 -22 33 -18 74 62 83 163 82 348 -3 511 -39 74 -39 74 -70 48z M671 603 l-22 -18 20 -41 c42 -86 52 -214 22 -271 -5 -10 -18 -36 -29 -58 l-19 -40 23 -18 c30 -23 27 -25 63 46 56 110 60 232 11 345 -29 67 -41 77 -69 55z M540 523 c-14 -9 -26 -17 -28 -19 -2 -1 4 -25 14 -53 18 -56 14 -112 -11 -161 -14 -26 -13 -29 10 -44 35 -23 42 -21 67 27 17 32 22 59 22 112 0 53 -5 80 -22 113 -26 49 -21 46 -52 25z" />
    </g>
  </svg>
);

export default UnmuteIcon;
