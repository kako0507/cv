import _ from 'lodash';
import React, { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import useOnClickOutside from '../../hooks/use-onclickoutside';
import Animated from '../../components/hearts/animated';
import { nop } from '../../utils/hearts';
import t from '../../constants/hearts/action-types';
import { gameEndPhases } from '../../constants/hearts/game';
import styles from './hearts.module.scss';

const getPlayerTitle = ({ playerNumber, playerName }) => (
  playerNumber !== undefined
    ? `${playerNumber.toString().padStart(3, '0')} - ${playerName}`
    : playerName
);

const ScoreBoard = () => {
  const {
    phase,
    players,
    showScoreBoard,
    eventHistory,
  } = useSelector((state) => state);
  const dispatch = useDispatch();
  const refClickOutside = useRef(null);
  const refScoreBoard = useRef(null);

  const handleToggleScores = (event) => {
    dispatch({
      type: t.HEARTS_TOGGLE_SCORES,
    });
    event.stopPropagation();
  };

  const downloadEventHistory = () => {
    const element = document.createElement('a');
    const file = new Blob(
      [eventHistory],
      { type: 'text/plain' },
    );
    element.href = URL.createObjectURL(file);
    element.download = 'game-log.json';
    refScoreBoard.current.appendChild(element);
    element.click();
    element.remove();
  };

  useOnClickOutside(
    refClickOutside,
    showScoreBoard
      ? handleToggleScores
      : nop,
    '#btn-score-board',
  );

  return (
    <div
      ref={refClickOutside}
      className={styles.scoreBoardContainer}
    >
      <Animated
        isVisible={!!showScoreBoard}
        animateOnMount={false}
      >
        <div
          ref={refScoreBoard}
          className={styles.scoreBoard}
        >
          {gameEndPhases.indexOf(phase) > -1 && (
            <div className={styles.starContainer}>
              {players && players
                .filter(({ rank }) => rank === 1)
                .map((player) => (
                  <FontAwesomeIcon
                    className={styles.star}
                    icon={faStar}
                    key={getPlayerTitle(player)}
                  />
                ))}
            </div>
          )}
          <table>
            <tbody>
              {players && players.map(({
                dealsInfo,
                gameScore,
                ...player
              }) => {
                const playerTitle = getPlayerTitle(player);
                return (
                  <tr key={playerTitle}>
                    <td
                      title={playerTitle}
                      className={styles.tdPlayerName}
                    >
                      {playerTitle}
                    </td>
                    {_.range(1, 5).map((dealNumber) => {
                      const { score } = (dealsInfo && dealsInfo[dealNumber]) || {};
                      return (
                        <td
                          className={styles.tdDealScore}
                          key={`deal-score-${dealNumber}`}
                        >
                          <div>{score}</div>
                        </td>
                      );
                    })}
                    <td className={styles.tdGameScore}>
                      {gameScore}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {eventHistory && (
          <button type="button" onClick={downloadEventHistory}>
            Download Game Log for Replaying
          </button>
        )}
      </Animated>
    </div>
  );
};

export default ScoreBoard;
