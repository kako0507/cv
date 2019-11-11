import React from 'react';
import PropTypes from 'prop-types';

const Spade = ({ style }) => (
  <svg
    style={style}
    viewBox="0 0 102.000000 133.000000"
    preserveAspectRatio="xMidYMid meet"
  >
    <g
      transform="translate(0.000000,133.000000) scale(0.100000,-0.100000)"
      stroke="none"
    >
      <path
        d="M490 1288 c-35 -120 -81 -182 -285 -383 -174 -172 -197 -209 -203
                -320 -6 -106 35 -183 120 -226 104 -53 206 -31 305 65 71 69 73 67 49 -45 -26
                -123 -90 -215 -188 -273 -24 -14 -84 -36 -133 -49 -63 -17 -91 -29 -93 -40 -3
                -16 34 -17 451 -17 435 0 455 1 450 18 -3 13 -21 22 -64 31 -101 20 -168 52
                -226 104 -82 76 -120 154 -138 292 l-7 49 47 -52 c110 -123 260 -145 365 -55
                60 52 80 98 80 185 0 118 -22 153 -213 342 -175 174 -224 239 -264 346 -14 39
                -29 70 -33 70 -4 0 -13 -19 -20 -42z"
      />
    </g>
  </svg>
);

Spade.propTypes = {
  style: PropTypes.objectOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
  ).isRequired,
};

export default Spade;
