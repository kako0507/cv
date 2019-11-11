import _ from 'lodash';
import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faArrowUp,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import AnimatedPopover from '../../components/hearts/animated-popover';
import {
  modes,
  southPlayerIndex,
  maxCardSelection,
} from '../../constants/hearts/game';
import t from '../../constants/hearts/action-types';
import e from '../../constants/hearts/event-types';

const passCardGroup = {
  [(southPlayerIndex + 1) % 4]: {
    icon: faArrowLeft,
  },
  [(southPlayerIndex + 2) % 4]: {
    icon: faArrowUp,
  },
  [(southPlayerIndex + 3) % 4]: {
    icon: faArrowRight,
  },
};

const UserActionPopover = () => {
  const {
    layout,
    mode,
    phase,
    selectedCards,
    passCardReceiver,
  } = useSelector((state) => state);
  const dispatch = useDispatch();

  const handlePassCardsClick = useCallback(() => {
    if (selectedCards.length === maxCardSelection[phase]) {
      dispatch({ type: t.HEARTS_PASS_CARDS });
    }
  }, [selectedCards, phase, dispatch]);

  const handleJoinGame = (m, log) => {
    dispatch({
      type: t.HEARTS_JOIN,
      payload: { mode: m, log },
    });
  };

  // Human play mode
  const handlePlayMode = () => {
    handleJoinGame(modes.HUMAN);
  };

  // Watch mode
  const handleWatchMode = () => {
    handleJoinGame(modes.WATCH);
  };

  // Replay mode
  const handleReplayMode = ({ target: { files } }) => {
    const [file] = files;
    if (file) {
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = ({ target: { result } }) => {
        handleJoinGame(
          modes.REPLAY,
          {
            fileName: file.name,
            events: JSON.parse(result),
          },
        );
      };
      // TODO: reader.onerror
    }
  };

  if (!layout?.layoutDetail) {
    return null;
  }
  const {
    cardHeight,
    rowMargin,
    scoreHeight,
    playerInfoFontSize,
    playerInfoMargin,
  } = layout.layoutDetail;
  const popoverBottom = _.sum([
    cardHeight,
    rowMargin,
    scoreHeight,
    playerInfoFontSize,
    playerInfoMargin * 8,
  ]);
  return (
    <>
      <AnimatedPopover
        isVisible={!phase}
      >
        <>
          <div>Please Choose a Game Mode</div>
          <button
            type="button"
            onClick={handlePlayMode}
          >
            Play
          </button>
          <button
            type="button"
            onClick={handleWatchMode}
          >
            Watch mode
          </button>
          <label htmlFor="game-log">
            Replay from JSON log
            <input
              id="game-log"
              type="file"
              onChange={handleReplayMode}
            />
          </label>
        </>
      </AnimatedPopover>
      {mode === modes.HUMAN && (
        <>
          <AnimatedPopover
            isVisible={phase === e.PASS_CARDS}
            bottom={popoverBottom}
          >
            <>
              <div>Pass three cards</div>
              <button
                type="button"
                onClick={handlePassCardsClick}
                disabled={!selectedCards || selectedCards.length !== maxCardSelection[phase]}
              >
                {passCardReceiver !== undefined && (
                  <FontAwesomeIcon
                    icon={passCardGroup[passCardReceiver].icon}
                  />
                )}
              </button>
            </>
          </AnimatedPopover>
        </>
      )}
    </>
  );
};

export default UserActionPopover;
