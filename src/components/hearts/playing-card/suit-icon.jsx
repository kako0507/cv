import React from 'react';
import PropTypes from 'prop-types';
import Diamond from './diamond';
import Club from './club';
import Heart from './heart';
import Spade from './spade';

const SuitIcon = ({ suit, style }) => {
  switch (suit) {
    case 'D':
      return <Diamond style={style} />;
    case 'C':
      return <Club style={style} />;
    case 'H':
      return <Heart style={style} />;
    case 'S':
      return <Spade style={style} />;
    default:
      return null;
  }
};

SuitIcon.propTypes = {
  suit: PropTypes.string.isRequired,
  style: PropTypes.objectOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
  ),
};

SuitIcon.defaultProps = {
  style: {},
};

export default SuitIcon;
