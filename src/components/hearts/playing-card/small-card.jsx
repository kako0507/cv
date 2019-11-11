import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { suitNames, numberDisplayNames } from '../../../constants/hearts/playing-card';
import CardSuit from './card-suit';
import styles from './card.module.scss';

const SmallCard = ({
  pos: {
    x, y,
    rotation,
  },
  layout: {
    borderRadius,
    suitSize,
  },
  num,
  suit,
  slowMotion,
  shootingMoon,
}) => {
  const width = suitSize + 12;
  const height = suitSize * 2 + 8;
  return (
    <div
      className={classNames(
        styles.card,
        styles.smallCard,
        styles[suitNames[suit]],
        {
          [styles.slowMotion]: slowMotion,
          [styles.nearShootingMoon]: shootingMoon === 1,
          [styles.shootingMoon]: shootingMoon === 2,
        },
      )}
      style={{
        width,
        height,
        marginTop: -(height / 2),
        marginLeft: -(width / 2),
        borderRadius,
        transform: `rotate(${rotation || 0}deg) translate(${x}px, ${y}px)`,
      }}
    >
      <CardSuit
        suitSize={suitSize}
        number={numberDisplayNames[num]}
        suit={suit}
      />
    </div>
  );
};

SmallCard.propTypes = {
  num: PropTypes.string.isRequired,
  suit: PropTypes.string.isRequired,
  pos: PropTypes.objectOf(PropTypes.number).isRequired,
  layout: PropTypes.objectOf(PropTypes.number).isRequired,
  shootingMoon: PropTypes.bool.isRequired,
  slowMotion: PropTypes.bool,
};

SmallCard.defaultProps = {
  slowMotion: false,
};

export default SmallCard;
