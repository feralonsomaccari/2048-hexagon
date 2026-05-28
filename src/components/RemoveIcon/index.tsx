type props = {
  size?: number | string;
  className?: string;
};

// Traced from the original remove.png, rotated to a flat-top hexagon to match
// the board tiles, mirrored so the X sits at the bottom-right, and stroked to
// match the weight of the other power-up icons.
const RemoveIcon = ({ size = "1em", className }: props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 512 512"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    <g transform="translate(256 256) scale(1.28) translate(-256 -256)">
      <g transform="translate(512 0) scale(-1 1)">
        <g transform="rotate(90 256 256)">
          <g
            transform="translate(0,512) scale(0.1,-0.1)"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="150"
            strokeLinejoin="round"
            strokeLinecap="round"
          >
          <path d="M2410 4203 c-14 -6 -436 -250 -940 -543 -169 -99 -241 -146 -258 -170 l-22 -33 0 -662 0 -662 23 -33 c23 -34 40 -44 817 -497 370 -216 387 -224 430 -220 36 3 99 36 330 172 157 92 288 172 292 179 20 29 -5 76 -40 76 -9 0 -143 -74 -297 -165 -153 -91 -285 -165 -292 -165 -7 0 -143 76 -301 168 -158 93 -416 244 -574 336 l-288 168 0 643 0 643 223 130 c556 324 894 520 915 531 26 14 -45 52 687 -373 253 -147 468 -275 478 -283 16 -15 17 -57 17 -607 l0 -590 45 44 45 44 0 566 c0 520 -1 567 -18 593 -17 29 -99 79 -842 509 -335 195 -387 219 -430 201z" />
          <path d="M2892 2364 c-51 -35 -38 -53 225 -316 l248 -248 -60 -62 c-33 -35 -143 -147 -245 -251 -102 -103 -186 -197 -188 -208 -5 -27 25 -59 54 -59 16 0 93 71 270 251 l249 251 246 -251 c258 -264 274 -275 312 -233 10 10 17 27 17 38 0 12 -96 115 -250 269 l-250 250 250 250 c161 162 250 258 250 271 0 32 -24 57 -54 57 -24 0 -71 -43 -278 -249 l-249 -249 -242 247 c-133 136 -251 249 -262 252 -11 3 -31 -1 -43 -10z" />
          </g>
        </g>
      </g>
    </g>
  </svg>
);

export default RemoveIcon;
