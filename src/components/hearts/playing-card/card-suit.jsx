import React from 'react';
import PropTypes from 'prop-types';
import SuitIcon from './suit-icon';
import styles from './card.module.scss';

const CardSuit = ({
  number,
  suit,
  style,
  suitSize,
}) => {
  const numStyle = {
    width: suitSize + 4,
    lineHeight: `${suitSize}px`,
    fontSize: suitSize,
  };
  const suitStyle = {
    width: suitSize + 4,
    height: suitSize,
  };
  return (
    <div
      className={styles.cardValue}
      style={style}
    >
      <div
        className={styles.num}
        style={numStyle}
      >
        {number}
      </div>
      <SuitIcon
        suit={suit}
        style={suitStyle}
      />
    </div>
  );
};

CardSuit.propTypes = {
  number: PropTypes.string,
  suit: PropTypes.string,
  style: PropTypes.objectOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
  ),
  suitSize: PropTypes.number.isRequired,
};

CardSuit.defaultProps = {
  number: undefined,
  suit: undefined,
  style: undefined,
};

export default CardSuit;
