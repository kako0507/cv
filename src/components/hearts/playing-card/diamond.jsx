import React from 'react';
import PropTypes from 'prop-types';

const Diamond = ({ style }) => (
  <svg
    style={style}
    viewBox="0 0 100.000000 134.000000"
    preserveAspectRatio="xMidYMid meet"
  >
    <g
      transform="translate(0.000000,131.000000) scale(0.100000,-0.100000)"
      stroke="none"
    >
      <path
        d="M410 1223 c-81 -127 -240 -343 -343 -466 l-66 -78 82 -97 c108 -129
                242 -310 330 -449 40 -62 75 -113 78 -113 3 0 41 55 85 123 96 149 198 287
                316 429 l89 107 -77 93 c-105 126 -224 288 -324 438 -45 69 -85 126 -88 127
                -4 1 -41 -50 -82 -114z"
      />
    </g>
  </svg>
);

Diamond.propTypes = {
  style: PropTypes.objectOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
  ).isRequired,
};

export default Diamond;
