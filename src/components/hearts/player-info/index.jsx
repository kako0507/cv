import _ from 'lodash';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { southPlayerIndex } from '../../../constants/hearts/game';
import e from '../../../constants/hearts/event-types';
import styles from './player-info.module.scss';

const PlayerInfo = ({
  layoutDetail,
  phase,
  players,
}) => {
  if (!layoutDetail || phase === e.GAME_END) {
    return null;
  }
  return (
    <div className={styles.playerInfoContainer}>
      {players && _.sortBy(players, ({ playerNumber }) => playerNumber).map(({
        playerIndex,
        playerNumber,
        playerName,
        dealScore,
        pos,
        infoPos,
      }) => {
        const playerTitle = playerNumber !== undefined
          ? `${playerNumber.toString().padStart(3, '0')} - ${playerName}`
          : playerName;
        const southPlayerDiff = (playerIndex - southPlayerIndex + 4) % 4;
        const scoreContainerHeight = layoutDetail.scoreHeight + layoutDetail.playerInfoMargin * 2;

        let marginLeft = -(layoutDetail.playerInfoWidth / 2);
        const paddingTop = southPlayerDiff === 2 ? 0 : layoutDetail.playerInfoMargin;
        let paddingLeft;
        let paddingRight;
        let positionContainerBottom;
        let positionContainerLeft;
        let positionMarginTop;

        if (southPlayerDiff === 1) {
          marginLeft += layoutDetail.playerInfoMargin;
          paddingLeft = layoutDetail.scoreWidth - layoutDetail.scoreHeight;
          positionMarginTop = scoreContainerHeight;
        } else if (southPlayerDiff === 3) {
          marginLeft -= layoutDetail.playerInfoMargin;
          paddingRight = layoutDetail.scoreWidth - layoutDetail.scoreHeight;
          positionMarginTop = scoreContainerHeight;
        } else {
          if (southPlayerDiff === 2) {
            positionContainerBottom = 0;
          }
          positionContainerLeft = layoutDetail.scoreWidth;
        }

        const scoreContainerStyle = {
          height: scoreContainerHeight,
          transform: `rotate(${-infoPos.rotation}deg)`,
          paddingTop: layoutDetail.playerInfoMargin,
          paddingRight,
          paddingBottom: layoutDetail.playerInfoMargin,
          paddingLeft,
          lineHeight: `${layoutDetail.scoreHeight}px`,
        };

        return (
          <div
            className={styles[`south-diff-${southPlayerDiff}`]}
            style={{
              transform: `rotate(${infoPos.rotation}deg) translate(0, ${infoPos.y}px)`,
              width: layoutDetail.playerInfoWidth,
              marginLeft,
              marginTop: -_.sum([
                _.sum([
                  layoutDetail.playerInfoMargin,
                  layoutDetail.scoreHeight,
                  layoutDetail.playerInfoFontSize,
                ]) / 2,
                layoutDetail.playerInfoMargin,
              ]),
            }}
            key={playerTitle}
          >
            <div
              className={classNames(
                styles.dealScoreContainer,
                { [styles.transparent]: !playerNumber },
              )}
              style={scoreContainerStyle}
            >
              <div
                style={{
                  width: layoutDetail.scoreWidth,
                  height: layoutDetail.scoreHeight,
                  borderRadius: layoutDetail.borderRadius,
                  padding: `${layoutDetail.playerInfoMargin}px 0`,
                  fontSize: layoutDetail.playerInfoFontSize,
                  lineHeight: `${layoutDetail.playerInfoFontSize}px`,
                }}
              >
                {dealScore || 0}
              </div>
            </div>
            <div
              className={styles.positionContainer}
              style={{
                ...scoreContainerStyle,
                top: positionContainerBottom !== 0 ? 0 : undefined,
                bottom: positionContainerBottom,
                left: positionContainerLeft,
                display: 'none',
              }}
            >
              <div
                style={{
                  width: layoutDetail.scoreHeight,
                  height: layoutDetail.scoreHeight,
                  marginTop: positionMarginTop,
                  borderRadius: layoutDetail.scoreHeight / 2,
                  padding: `${layoutDetail.playerInfoMargin}px 0`,
                  fontSize: layoutDetail.playerInfoFontSize,
                  lineHeight: `${layoutDetail.playerInfoFontSize}px`,
                }}
              >
                {pos}
              </div>
            </div>
            <div
              className={styles.playerNameContainer}
              style={{
                height: _.sum([
                  layoutDetail.playerInfoFontSize,
                  layoutDetail.playerInfoMargin,
                  paddingTop,
                ]),
                lineHeight: `${layoutDetail.playerInfoFontSize}px`,
                paddingTop,
                paddingBottom: layoutDetail.playerInfoMargin,
              }}
            >
              <span
                title={playerTitle}
                className={styles.playerName}
                style={{
                  fontSize: layoutDetail.playerInfoFontSize,
                }}
              >
                {playerTitle}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

PlayerInfo.propTypes = {
  layoutDetail: PropTypes.objectOf(PropTypes.number),
  phase: PropTypes.string,
  players: PropTypes.arrayOf(PropTypes.shape({
    playerNumber: PropTypes.number,
  })),
};

PlayerInfo.defaultProps = {
  layoutDetail: undefined,
  phase: '',
  players: undefined,
};

export default PlayerInfo;
