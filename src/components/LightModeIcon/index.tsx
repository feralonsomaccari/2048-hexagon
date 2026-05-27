type props = {
  /** Pixel size of the (square) icon. Defaults to 1em so it scales with text. */
  size?: number | string;
  className?: string;
};

// Light-mode (brightness) icon, traced from lightmode.webp. Uses
// `fill: currentColor` so it matches its label color in both themes, like the
// other icons. Keeps potrace's flip/scale transform; the half-circle renders as
// a proper cutout. The viewBox matches the source image's 300px dimensions.
const LightModeIcon = ({ size = "1em", className }: props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 300 300"
    fill="currentColor"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    <g transform="translate(0,300) scale(0.1,-0.1)">
      <path d="M1435 2873 c-16 -8 -105 -89 -196 -179 l-166 -164 -239 0 c-370 -1 -364 6 -364 -365 l0 -239 -164 -165 c-190 -193 -196 -201 -196 -259 0 -63 5 -70 191 -258 l169 -170 0 -246 c0 -238 1 -246 23 -278 50 -74 50 -74 333 -80 l254 -5 172 -172 c177 -175 192 -186 260 -185 54 1 64 9 246 194 l161 163 255 5 c364 7 349 -8 356 356 l5 255 165 163 c255 254 255 254 2 509 l-167 168 -5 252 c-7 367 3 357 -365 357 l-239 0 -165 165 c-198 196 -244 221 -326 178z m205 -764 c330 -76 546 -428 464 -758 -64 -256 -297 -458 -536 -464 l-63 -2 -3 595 c-1 327 0 605 3 618 6 25 55 30 135 11z" />
    </g>
  </svg>
);

export default LightModeIcon;
