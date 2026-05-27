type props = {
  /** Pixel size of the (square) icon. Defaults to 1em so it scales with text. */
  size?: number | string;
  className?: string;
};

// Muted-speaker (sound off) icon, cropped and traced from soundicon.png. Uses
// `fill: currentColor` so it matches its label color in both themes, like the
// other icons. Keeps potrace's flip/scale transform.
const MuteIcon = ({ size = "1em", className }: props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 87 88"
    fill="currentColor"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    <g transform="translate(0,88) scale(0.1,-0.1)">
      <path d="M36 831 l-28 -29 106 -103 c58 -57 106 -107 106 -111 0 -5 -47 -8 -105 -8 l-105 0 0 -140 0 -140 93 0 92 0 115 -115 c63 -63 118 -115 122 -115 5 0 8 68 8 151 l0 151 95 -94 95 -93 -23 -17 c-12 -10 -37 -23 -54 -30 -31 -11 -33 -15 -33 -60 0 -35 4 -48 14 -48 21 0 104 37 138 61 l30 22 47 -47 47 -46 29 30 29 31 -389 389 c-215 215 -392 390 -396 390 -3 0 -18 -13 -33 -29z M520 806 c0 -45 1 -46 50 -71 139 -70 207 -206 180 -357 l-12 -68 30 -30 c38 -38 40 -38 58 6 91 218 -53 512 -273 559 l-33 7 0 -46z M382 767 c-23 -23 -42 -46 -42 -49 0 -9 86 -98 94 -98 3 0 6 43 6 95 0 52 -4 95 -8 95 -4 0 -27 -19 -50 -43z M520 581 c0 -46 4 -53 54 -105 66 -69 80 -72 71 -13 -10 59 -39 111 -78 141 -45 35 -47 34 -47 -23z" />
    </g>
  </svg>
);

export default MuteIcon;
