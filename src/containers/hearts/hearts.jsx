import _ from 'lodash';
import React, { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import sagaMiddleware from '../../store/saga-middleware';
import heartsSaga from '../../sagas/hearts';
import { Card, SmallCard } from '../../components/hearts/playing-card';
import Animated from '../../components/hearts/animated';
import CountDown from '../../components/hearts/count-down';
import PlayerInfo from '../../components/hearts/player-info';
import {
  modes,
  hideCardsPhases,
  gameImmediateStatus,
} from '../../constants/hearts/game';
import t from '../../constants/hearts/action-types';
import e from '../../constants/hearts/event-types';
import ButtonGroup from './button-group';
import UserActionPopover from './user-action-popover';
import ScoreBoard from './score-board';
import styles from './hearts.module.scss';
import heartsTitle from './hearts-title.svg';

const isCardVisible = (card) => card.pos.rotateY === 0;
const isCardSelectable = ({ mode, card }) => _.every([
  mode === modes.HUMAN,
  card.clickable,
  isCardVisible(card),
]);

const isNeedToMask = ({
  mode,
  card,
  turnPlayer,
  prevTurnPlayer,
  handCardGroups,
  playedCardGroups,
}) => {
  const isPrevTurnCard = _.every([
    prevTurnPlayer !== -1,
    playedCardGroups[prevTurnPlayer]?.indexOf(card.id) > -1,
  ]);
  const isTurnCard = (
    turnPlayer === -1 || (
      handCardGroups[turnPlayer]?.indexOf(card.id) > -1
    )
  );
  return _.every([
    !card.collected,
    !isPrevTurnCard,
    !isTurnCard || _.every([
      mode === modes.HUMAN,
      isTurnCard,
      isCardVisible(card),
      !card.clickable,
    ]),
  ]);
};

let saga;

const Hearts = () => {
  const {
    layout,
    mode,
    gameStatus,
    gameId,
    dealNumber,
    fileName,
    countDown,
    phase,
    cardList,
    highlightCard,
    scoreCards,
    handCardGroups,
    playedCardGroups,
    players,
    prevTurnPlayer,
    turnPlayer,
    slowMotion,
    eventErrorInfo,
  } = useSelector((state) => state);
  const dispatch = useDispatch();

  const handleCardHover = useCallback(({ id }) => {
    if (mode === modes.HUMAN) {
      if (phase === e.PASS_CARDS) {
        dispatch({
          type: t.HEARTS_HOVER_CARD,
          payload: id,
        });
      } else {
        dispatch({
          type: t.HEARTS_SELECT_CARDS,
          payload: id,
        });
      }
    }
  }, [mode, phase, dispatch]);
  const handleCardClick = useCallback(() => {
    dispatch({
      type: t.HEARTS_CLICK_CARD,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loader = document.getElementById('init-loader');

    const handleSetLayoutRatio = () => {
      dispatch({
        type: t.HEARTS_SET_LAYOUT_RATIO,
      });
    };
    const handleKeyDown = ({ key }) => {
      dispatch({
        type: t.HEARTS_KEY_DOWN,
        payload: key,
      });
    };

    if (loader) {
      loader.remove();
    }
    document.body.classList.add(styles.heartsContainer);

    saga = sagaMiddleware.run(heartsSaga);
    window.addEventListener(
      'resize',
      handleSetLayoutRatio,
    );
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove(styles.heartsContainer);
      window.removeEventListener(
        'resize',
        handleSetLayoutRatio,
      );
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      );

      dispatch({
        type: t.HEARTS_CLOSE_GAME,
      });
      if (saga) {
        saga.cancel();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rowMargin = layout?.layoutDetail?.rowMargin || 0;
  let titleGameNumber;
  let countDownFontSize = 0;
  let dealNumberFontSize = 0;
  let scoreCardsCount = 0;
  let shootingMoon = 1;
  let shootingMoonPlayer;
  if (_.every([
    mode === modes.REPLAY,
    gameId !== undefined,
  ])) {
    titleGameNumber = `Game ID: ${gameId}`;
  }

  if (layout?.layoutDetail) {
    ({ layoutDetail: { countDownFontSize, dealNumberFontSize } } = layout);
  }

  if (scoreCards) {
    scoreCards.forEach(({ value, playerIndex }) => {
      if (value !== 'TC') {
        scoreCardsCount += 1;
        if (shootingMoonPlayer !== undefined) {
          if (shootingMoonPlayer !== playerIndex) {
            shootingMoon = 0;
          }
        } else {
          shootingMoonPlayer = playerIndex;
        }
      }
    });
    if (shootingMoon) {
      if (scoreCardsCount === 14) {
        shootingMoon = 2;
      } else if (scoreCardsCount >= 10) {
        shootingMoon = 1;
      } else {
        shootingMoon = 0;
      }
    }
  }

  return (
    <div className={styles.container}>
      <div
        id="hearts-animation"
        className={styles.animationContainer}
      />
      <div className={styles.titleImage}>
        <img
          alt="trendhearts"
          src={heartsTitle}
        />
        {fileName && `Log File: ${fileName}`}
      </div>
      <div
        className={styles.dealNumber}
        style={{
          fontSize: dealNumberFontSize,
          left: rowMargin * 4,
          bottom: rowMargin * 4,
        }}
      >
        {titleGameNumber}
        {(titleGameNumber && dealNumber) ? ' / ' : ''}
        {dealNumber ? `Deal ${dealNumber}` : ''}
      </div>
      <CountDown
        countDownFontSize={countDownFontSize}
        value={countDown}
      />
      {(_.every([
        cardList,
        phase,
        hideCardsPhases.indexOf(phase) === -1,
      ])) && cardList.map((card) => (
        /* eslint-disable react/jsx-props-no-spreading */
        <Card
          {...card}
          {...(isCardSelectable({ mode, card })
            ? {
              onClick: handleCardClick,
              onMouseOver: handleCardHover,
            }
            : {}
          )}
          layout={layout.layoutDetail}
          mask={isNeedToMask({
            mode,
            card,
            turnPlayer,
            prevTurnPlayer,
            handCardGroups,
            playedCardGroups,
          })}
          slowMotion={slowMotion}
          disableAnimation={_.every([
            card.collected,
            slowMotion,
            gameStatus === gameImmediateStatus.PAUSED,
          ])}
          hover={_.every([
            [e.PASS_CARDS, e.YOUR_TURN].indexOf(phase) > -1,
            highlightCard === card.id,
          ])}
          key={card.id}
        />
        /* eslint-enable react/jsx-props-no-spreading */
      ))}
      {scoreCards && _.sortBy(scoreCards, ({ value }) => value).map((card) => (
        /* eslint-disable react/jsx-props-no-spreading */
        <Animated key={card.value}>
          <SmallCard
            {...card}
            shootingMoon={_.every([
              shootingMoon,
              shootingMoonPlayer === card.playerIndex,
            ])}
            layout={layout.layoutDetail}
            slowMotion={slowMotion}
          />
        </Animated>
        /* eslint-enable react/jsx-props-no-spreading */
      ))}
      <ButtonGroup />
      <PlayerInfo
        layoutDetail={layout?.layoutDetail}
        phase={phase}
        players={players}
      />
      <UserActionPopover />
      <ScoreBoard />
      {eventErrorInfo && (
        <div className={styles.errorMsg}>
          {eventErrorInfo.msg}
        </div>
      )}
    </div>
  );
};

export default Hearts;
