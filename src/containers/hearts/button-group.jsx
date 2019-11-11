import _ from 'lodash';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPause,
  faRedo,
  faPlay,
  faPowerOff,
  faInfoCircle,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import {
  modes,
  gameImmediateStatus,
} from '../../constants/hearts/game';
import t from '../../constants/hearts/action-types';
import e from '../../constants/hearts/event-types';
import styles from './hearts.module.scss';

const ButtonGroup = () => {
  const {
    phase,
    mode,
    dealNumber,
    selectedDealNumber,
    gameStatus,
    disableManualAction,
    gameHistory,
    players,
  } = useSelector((state) => state);
  const dispatch = useDispatch();

  const restartNewGame = () => {
    dispatch({
      type: t.HEARTS_CLOSE_GAME,
    });
  };
  const handlePauseGame = () => {
    dispatch({
      type: t.HEARTS_PAUSE_GAME,
    });
  };
  const handleResumeGame = () => {
    dispatch({
      type: t.HEARTS_RESUME_GAME,
    });
  };
  const handleUndoGame = () => {
    dispatch({
      type: t.HEARTS_UNDO_GAME,
    });
  };
  const handleRedoGame = () => {
    dispatch({
      type: t.HEARTS_REDO_GAME,
    });
  };
  const handleRotatePlayers = () => {
    dispatch({
      type: t.HEARTS_ROTATE_PLAYERS,
    });
  };
  const handleToggleScores = () => {
    dispatch({
      type: t.HEARTS_TOGGLE_SCORES,
    });
  };

  return (
    <div className={styles.btnGroup}>
      {mode === modes.REPLAY && (
        <>
          {gameStatus === gameImmediateStatus.ONGOING && (
            <button
              type="button"
              onClick={handlePauseGame}
            >
              <FontAwesomeIcon icon={faPause} />
              {' '}
              Pause
            </button>
          )}
          {gameStatus === gameImmediateStatus.PAUSED && (
            <button
              type="button"
              onClick={handleRotatePlayers}
            >
              <FontAwesomeIcon icon={faRedo} />
              {' '}
              Rotate
            </button>
          )}
          {gameStatus === gameImmediateStatus.PAUSED && (
            <button
              type="button"
              onClick={handleResumeGame}
            >
              <FontAwesomeIcon icon={faPlay} />
              {' '}
              Resume
            </button>
          )}
        </>
      )}
      {players?.length === 4 && (
        <button
          type="button"
          onClick={restartNewGame}
        >
          <FontAwesomeIcon icon={faPowerOff} />
          {' '}
          Restart Game
        </button>
      )}
      {players?.length === 4 && (
        <button
          id="btn-score-board"
          type="button"
          onClick={handleToggleScores}
        >
          <FontAwesomeIcon icon={faInfoCircle} />
          {' '}
          Scores
        </button>
      )}
      {mode === modes.REPLAY && (
        <div className={styles.manualReplay}>
          {gameStatus === gameImmediateStatus.PAUSED && (
            <>
              <button
                type="button"
                onClick={handleUndoGame}
                disabled={
                  disableManualAction || (
                    _.every([
                      phase !== e.DEAL_END,
                      dealNumber === (selectedDealNumber || 1),
                      gameHistory.length <= 1,
                    ])
                  )
                }
              >
                <FontAwesomeIcon icon={faChevronLeft} />
                {' '}
                Previous
              </button>
              <button
                type="button"
                onClick={handleRedoGame}
                disabled={
                  disableManualAction || _.every([
                    phase === e.DEAL_END,
                    dealNumber === (selectedDealNumber || 4),
                  ])
                }
              >
                Next
                {' '}
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ButtonGroup;
