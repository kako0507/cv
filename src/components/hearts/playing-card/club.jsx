import React from 'react';
import PropTypes from 'prop-types';

const Club = ({ style }) => (
  <svg
    style={style}
    viewBox="0 0 134.000000 132.000000"
    preserveAspectRatio="xMidYMid meet"
  >
    <g
      transform="translate(0.000000,132.000000) scale(0.100000,-0.100000)"
      stroke="none"
    >
      <path
        d="M567 1296 c-62 -23 -116 -64 -148 -114 -55 -87 -63 -171 -25 -264 13
                -32 23 -58 22 -58 0 0 -19 7 -41 15 -127 46 -281 -22 -335 -147 -81 -187 22
                -397 210 -427 140 -23 277 42 366 173 l35 51 -6 -55 c-9 -81 -40 -179 -73
                -231 -56 -87 -138 -139 -277 -173 -64 -16 -84 -28 -85 -48 0 -5 205 -8 455 -8
                442 0 455 1 455 19 0 15 -11 22 -52 30 -114 24 -180 54 -241 110 -32 30 -69
                76 -83 103 -27 53 -54 155 -54 207 l0 34 39 -55 c63 -88 146 -141 245 -156
                192 -30 346 100 346 291 0 80 -13 125 -53 183 -63 92 -191 135 -299 101 -27
                -8 -48 -14 -48 -12 0 1 10 24 21 50 48 108 18 238 -73 320 -77 70 -204 95
                -301 61z"
      />
    </g>
  </svg>
);

Club.propTypes = {
  style: PropTypes.objectOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
  ).isRequired,
};

export default Club;
