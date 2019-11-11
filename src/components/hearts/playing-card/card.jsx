import React, { useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { suitNames, numberDisplayNames } from '../../../constants/hearts/playing-card';
import CardSuit from './card-suit';
import SuitIcon from './suit-icon';
import styles from './card.module.scss';
import receivedIcon from './received.svg';

const Card = (props) => {
  const {
    pos: {
      x, y,
      rotation,
      rotateY,
      zIndex,
    },
    layout: {
      borderRadius,
      cardHeight,
      cardWidth,
      suitSize,
    },
    num,
    suit,
    hover,
    mask,
    received,
    slowMotion,
    disableAnimation,
    timeout,
    error,
    onMouseOver,
    onClick,
  } = props;
  const isVisible = !rotateY;
  const isSouthPlayer = rotation === 0;
  const numTop = cardHeight / 30;
  const numLeft = cardWidth / 25;

  const elm = useRef(null);

  const handleMouseOver = useCallback(() => {
    if (onMouseOver) {
      onMouseOver(props);
    }
  }, [onMouseOver, props]);
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(props);
    }
  }, [onClick, props]);

  return (
    /* eslint-disable jsx-a11y/mouse-events-have-key-events */
    /* eslint-disable jsx-a11y/click-events-have-key-events */
    // handle a11y by parent component
    <div
      ref={elm}
      className={classNames(
        styles.card,
        styles[suitNames[suit]],
        {
          [styles.showMask]: mask,
          [styles.unclickable]: !onClick,
          [styles.clickable]: !!onClick,
          [styles.hover]: hover,
          [styles.slowMotion]: slowMotion,
          [styles.disableAnimation]: disableAnimation,
        },
      )}
      style={{
        width: cardWidth,
        height: cardHeight,
        marginTop: -(cardHeight / 2),
        marginLeft: -(cardWidth / 2),
        borderRadius,
        zIndex,
        transform: `rotate(${rotation || 0}deg) translate3d(${x}px, ${y}px, ${zIndex}px) rotateY(${rotateY}deg)`,
      }}
      role="button"
      tabIndex="0"
      onMouseOver={isSouthPlayer ? handleMouseOver : undefined}
      onClick={isSouthPlayer ? handleClick : undefined}
    >
      <div
        className={styles.front}
        style={{
          borderRadius,
        }}
      >
        {isVisible && (
          <>
            <CardSuit
              style={{
                top: numTop,
                left: numLeft,
              }}
              suitSize={suitSize}
              number={numberDisplayNames[num]}
              suit={suit}
            />
            <CardSuit
              style={{
                right: numLeft,
                bottom: numTop,
              }}
              suitSize={suitSize}
              number={numberDisplayNames[num]}
              suit={suit}
            />
            <div
              className={styles.status}
              style={{
                left: numLeft * 1.5,
                bottom: numTop,
              }}
            >
              {(timeout || error) && (
                <div
                  style={{
                    width: suitSize,
                    height: suitSize,
                  }}
                >
                  <i
                    className={classNames(
                      'tmicon',
                      {
                        'tmicon-time-off': timeout,
                        'tmicon-warning-circle': error,
                        [styles.error]: error,
                      },
                    )}
                    style={{
                      fontSize: suitSize,
                    }}
                  />
                </div>
              )}
              {received && (
                <img
                  alt="received"
                  style={{
                    marginTop: numTop / 2,
                    width: suitSize,
                    height: suitSize,
                  }}
                  src={receivedIcon}
                />
              )}
            </div>
            <SuitIcon suit={suit} />
          </>
        )}
      </div>
      <div
        className={styles.back}
        style={{
          borderRadius,
          borderWidth: (borderRadius * 7) / 8,
        }}
      />
    </div>
    /* eslint-enable jsx-a11y/mouse-events-have-key-events */
    /* eslint-enable jsx-a11y/click-events-have-key-events */
  );
};

Card.propTypes = {
  pos: PropTypes.objectOf(PropTypes.number).isRequired,
  layout: PropTypes.objectOf(PropTypes.number).isRequired,
  num: PropTypes.string,
  suit: PropTypes.string,
  hover: PropTypes.bool,
  mask: PropTypes.bool,
  received: PropTypes.bool,
  slowMotion: PropTypes.bool,
  disableAnimation: PropTypes.bool,
  timeout: PropTypes.bool,
  error: PropTypes.bool,
  onMouseOver: PropTypes.func,
  onClick: PropTypes.func,
};

Card.defaultProps = {
  num: '',
  suit: '',
  hover: false,
  mask: false,
  received: false,
  slowMotion: false,
  disableAnimation: false,
  timeout: false,
  error: false,
  onMouseOver: undefined,
  onClick: undefined,
};

export default Card;
