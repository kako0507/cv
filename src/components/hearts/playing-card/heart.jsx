import React from 'react';
import PropTypes from 'prop-types';

const Heart = ({ style }) => (
  <svg
    style={style}
    viewBox="0 0 115.000000 132.000000"
    preserveAspectRatio="xMidYMid meet"
  >
    <g
      transform="translate(0.000000,132.000000) scale(0.100000,-0.100000)"
      stroke="none"
    >
      <path
        d="M154 1296 c-130 -61 -184 -207 -134 -368 23 -75 59 -133 201 -324
                223 -297 288 -404 330 -533 13 -39 26 -71 30 -71 4 0 10 15 13 34 4 19 32 85
                64 147 54 108 138 231 308 454 136 180 184 287 184 414 0 90 -20 140 -75 196
                -56 55 -106 75 -196 75 -86 0 -152 -26 -206 -82 -33 -35 -83 -122 -83 -144 0
                -27 -15 -13 -34 31 -26 63 -101 144 -161 171 -70 33 -170 33 -241 0z"
      />
    </g>
  </svg>
);

Heart.propTypes = {
  style: PropTypes.objectOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
  ).isRequired,
};

export default Heart;
