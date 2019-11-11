import ensureArray from 'ensure-array';
import _ from 'lodash';
import {
  all,
  call,
  cancel,
  fork,
  put,
  putResolve,
  race,
  select,
  take,
  takeEvery,
  takeLatest,
  throttle,
} from 'redux-saga/effects';
import {
  eventChannel,
} from 'redux-saga';
import lottie from 'lottie-web';
import { getUserInfo } from '../../utils/hearts';
import webworker from '../../api/webworker/hearts';
import {
  modes,
  watcherEvents,
  gameEndPhases,
  gameImmediateStatus,
  redoPhaseStep,

  second,
  distributeTime,
  commandInterval,
  newRoundInterval,
  newDealInterval,
} from '../../constants/hearts/game';
import t from '../../constants/hearts/action-types';
import e from '../../constants/hearts/event-types';
import shootingMoonAnimData from './shoot.json';
import shootingMoonAudioData from './shoot.mp3';

const shootingMoonAudio = typeof Audio !== 'undefined' && new Audio(shootingMoonAudioData);

const delay = (ms, noDelay) => (noDelay
  ? Promise.resolve
  : new Promise((res) => setTimeout(res, ms))
);

const sortCardsDelay = 500;
const passCardsDelay = 2000;
const collectRoundTrickDelay = 1000;
const commandIntervalManual = 100;

let worker;
let shootingMoonAnim;
const shootingMoonPlay = 1;
let shootingMoonPlayTime = 0;

function setShootingMoonFlag() {
  if (shootingMoonAnim) {
    shootingMoonAnim.destroy();
  }
}

function setShootingMoonSound() {
  shootingMoonPlayTime += 1;
  if (shootingMoonPlayTime < shootingMoonPlay) {
    shootingMoonAudio.play();
  }
}

function* setLayoutRatio(i) {
  const layoutRatio = Math.min(
    window.innerWidth / 1080,
    window.innerHeight / 1080,
  );

  const { phase } = yield select((state) => state);

  if (gameEndPhases.indexOf(phase) === -1) {
    yield put({
      type: t.HEARTS_SET_ALL_CARDS_POS,
      payload: { layoutRatio, init: i },
    });
  }
}

function* initAll() {
  try {
    localStorage.removeItem('hearts_history_deal_1');
    localStorage.removeItem('hearts_history_deal_2');
    localStorage.removeItem('hearts_history_deal_3');
    localStorage.removeItem('hearts_history_deal_4');
    yield call(setLayoutRatio, true);
    yield put({
      type: t.HEARTS_INIT,
    });
  } catch (error) {
    throw new Error(error);
  }
}

function initWebWorker({ playerInfo }) {
  return eventChannel((emitter) => {
    const data = playerInfo;

    if (worker?.close) {
      worker.close();
    }

    webworker.startHeartsGame({
      emitter,
      openMsg: {
        eventName: e.JOIN,
        data,
      },
    }).then((w) => {
      worker = w;
    });
    // unsubscribe function
    return () => {
    };
  });
}

// change position of cards for the animation of deal cards
function* distributeCards(disableAnimation) {
  for (let count = (disableAnimation ? 52 : 1); count <= 52; count += 1) {
    yield put({
      type: t.HEARTS_DISTRIBUTE_CARDS,
      payload: count,
    });
    yield delay(20, disableAnimation);
  }
  yield delay(sortCardsDelay, disableAnimation);
  yield put({
    type: t.HEARTS_SORT_CARDS,
  });
}

let shootingMoonEventIndex;

function* parseEvent(event) {
  const {
    eventName, data, disableAnimation, sequenceNumber,
  } = event;

  if (eventName === e.ROUND_END && shootingMoonEventIndex === undefined) {
    const shootingMoonPlayer = data.players.find(({ scoreCards }) => (
      scoreCards.filter((card) => card !== 'TC').length === 14
    ));
    if (shootingMoonPlayer) {
      shootingMoonEventIndex = sequenceNumber;
    }
  }
  if (shootingMoonEventIndex === sequenceNumber) {
    shootingMoonPlayTime = 0;
    if (shootingMoonAnim) {
      shootingMoonAnim.destroy();
    }
    shootingMoonAnim = lottie.loadAnimation({
      container: document.getElementById('hearts-animation'),
      renderer: 'canvas',
      loop: shootingMoonPlay - 1,
      autoplay: true,
      animationData: shootingMoonAnimData,
    });
    shootingMoonAnim.addEventListener('complete', setShootingMoonFlag);
    shootingMoonAudio.play();
  }

  const players = ensureArray(_.get(event, 'data.players'));
  if (players.length > 4) {
    yield put({
      type: t.HEARTS_PARSE_EVENT_FAILURE,
      payload: {
        event,
        msg: `Maximum number of players have been reached! (number of players in event: ${event.eventName}: ${event.data.players.length})`,
      },
    });
    return;
  }

  if (eventName === e.NEW_DEAL) {
    const { dealNumber, gameHistory } = yield select((state) => state);
    const dealStart = _.findIndex(gameHistory, ({ phase }) => (phase === e.NEW_DEAL));
    const dealEnd = _.findLastIndex(gameHistory, ({ phase }) => (phase === e.DEAL_END));
    if (dealStart > -1 && dealEnd > -1) {
      const prevGameHistory = gameHistory.slice(dealStart - 1, dealEnd);
      const newGameHistory = gameHistory.slice(dealEnd, gameHistory.length);

      localStorage.setItem(
        `hearts_history_deal_${dealNumber}`,
        JSON.stringify(prevGameHistory),
      );

      yield putResolve({
        type: t.HEARTS_RESET_HISTORY,
        payload: newGameHistory,
      });
    }
  }

  yield put({
    type: t.HEARTS_PARSE_EVENT,
    payload: event,
  });

  if (eventName === e.GAME_PREPARE) {
    const { countDown } = data;
    if (countDown === 1) {
      yield delay(1000);
      yield put({
        type: t.HEARTS_REMOVE_COUNT_DOWN,
      });
    }
  } else if (eventName === e.NEW_DEAL) {
    const dealCardsTask = yield fork(distributeCards, disableAnimation);

    yield take([
      t.HEARTS_SORT_CARDS,
      t.HEARTS_PAUSE_GAME_SUCCESS,
      t.HEARTS_PARSE_EVENT_SUCCESS,
      t.HEARTS_CLOSE_GAME_SUCCESS,
    ]);

    yield cancel(dealCardsTask);
    yield call(distributeCards, true);
  } else if (eventName === e.PASS_CARDS_END) {
    yield put({
      type: t.HEARTS_SORT_CARDS,
    });
  } else if (eventName === e.ROUND_END) {
    const delayTime = collectRoundTrickDelay;
    yield delay(delayTime, disableAnimation);
    yield put({
      type: t.HEARTS_SET_ROUND_TRICK_POS,
    });
    yield delay(delayTime, disableAnimation);
    yield put({
      type: t.HEARTS_SET_COLLECTED_CARDS_POS,
    });
  }

  yield delay(commandIntervalManual, !disableAnimation);

  yield put({
    type: t.HEARTS_PARSE_EVENT_SUCCESS,
  });
}

function* replay(es, sequenceNumber) {
  const events = ensureArray(es);

  for (let i = sequenceNumber; i < events.length; i += 1) {
    const event = events[i];

    if (!event) {
      return;
    }

    yield fork(parseEvent, {
      ...event,
      sequenceNumber: i,
      replay: true,
    });

    const { eventName } = event;

    if (eventName === e.GAME_PREPARE) {
      yield delay(second);
    } else if (eventName === e.NEW_DEAL) {
      yield delay(distributeTime);
    } else if (eventName === e.PASS_CARDS_END) {
      yield delay(passCardsDelay);
    } else if (eventName === e.ROUND_END) {
      yield delay(newRoundInterval);
    } else if (eventName === e.DEAL_END) {
      yield delay(newDealInterval);
    } else {
      yield delay(commandInterval);
    }
  }
}

function* join({ payload }) {
  try {
    const { playerNumber, playerName } = getUserInfo();
    const { mode, log, dealNumber } = payload;
    let fileName;
    let gameScoreInfo;

    shootingMoonEventIndex = undefined;
    shootingMoonAudio.addEventListener('ended', setShootingMoonSound);

    if (mode === modes.REPLAY) {
      // Replay mode
      let events;

      // SDK: replay from local file
      ({ fileName, events } = log);

      events = events.filter(({ eventName, data }) => {
        if (eventName === e.GAME_END) {
          gameScoreInfo = data.players.map(({ deals, gameScore }) => ({
            dealsInfo: _.mapKeys(
              deals,
              ({ dealNum }) => dealNum,
            ),
            gameScore,
          }));
          return false;
        }
        return watcherEvents.indexOf(eventName) > -1;
      });

      if (dealNumber) {
        events = events.filter(({ eventName, data }) => {
          const dn = data?.dealNumber;
          return _.some(
            dealNumber === dn,
            eventName === e.NEW_GAME,
            eventName === e.GAME_PREPARE,
          );
        });
      }

      let replayTask = yield fork(replay, events, 0);
      yield takeEvery(t.HEARTS_PAUSE_GAME, function* handlePauseGame() {
        yield cancel(replayTask);
        const { eventSequenceNumber } = yield select((state) => state);
        const event = events[eventSequenceNumber];
        if (event.eventName === e.NEW_DEAL) {
          yield call(distributeCards, true);
        }
        yield put({
          type: t.HEARTS_PAUSE_GAME_SUCCESS,
        });
      });
      yield takeEvery(t.HEARTS_RESUME_GAME, function* handleResumeGame() {
        const { eventSequenceNumber } = yield select((state) => state);
        replayTask = yield fork(replay, events, eventSequenceNumber + 1);
        yield put({
          type: t.HEARTS_RESUME_GAME_SUCCESS,
        });
      });
      yield throttle(
        commandIntervalManual,
        t.HEARTS_REDO_GAME,
        function* handleRedoGame() {
          const { eventSequenceNumber } = yield select((state) => state);
          const event = events[eventSequenceNumber + 1];
          if (event) {
            const stepCount = redoPhaseStep[event.eventName] || 1;
            for (let i = 1; i <= stepCount; i += 1) {
              const sequenceNumber = eventSequenceNumber + i;
              yield call(parseEvent, {
                ...events[sequenceNumber],
                sequenceNumber,
                disableAnimation: true,
                replay: true,
              });
            }
            yield put({
              type: t.HEARTS_REDO_GAME_SUCCESS,
            });
          }
        },
      );
      yield throttle(
        commandIntervalManual,
        t.HEARTS_UNDO_GAME,
        function* handleUndoGame() {
          const {
            gameStatus,
            disableManualAction,
            gameHistory,
            dealNumber: dealNum,
          } = yield select((state) => state);

          if (_.some([
            gameStatus !== gameImmediateStatus.PAUSED,
            disableManualAction,
          ])) {
            return;
          }

          if (gameHistory.length > 1) {
            yield put({
              type: t.HEARTS_UNDO_GAME_MEM,
            });
          } else if (gameHistory[0]?.phase !== e.NEW_GAME) {
            const newGameHistory = JSON.parse(localStorage.getItem(
              `hearts_history_deal_${dealNum}`,
            ));
            yield putResolve({
              type: t.HEARTS_RESET_HISTORY,
              payload: newGameHistory,
            });
            yield putResolve({
              type: t.HEARTS_UNDO_GAME_MEM,
            });
          }
        },
      );
    } else {
      let playerInfo;
      if (mode === modes.WATCH) {
        // Watch mode
        playerInfo = {};
      } else {
        // Human player
        playerInfo = {
          playerNumber,
          playerName,
          isHuman: true,
        };
      }
      const channel = yield call(initWebWorker, {
        playerInfo,
      });
      yield takeEvery(channel, parseEvent);
    }

    yield put({
      type: t.HEARTS_JOIN_SUCCESS,
      payload: {
        mode,
        fileName,
        gameScoreInfo,
        selectedDealNumber: dealNumber,
      },
    });
  } catch (error) {
    const errorMessage = _.get(error, 'message');
    yield put({
      type: t.HEARTS_JOIN_FAILURE,
      payload: { error: errorMessage },
    });
  }
}

function* selectCard(phase) {
  switch (phase) {
    case e.PASS_CARDS:
      yield put({
        type: t.HEARTS_SELECT_CARDS,
      });
      break;
    case e.YOUR_TURN:
      yield put({
        type: t.HEARTS_PICK_CARD,
      });
      break;
    default:
  }
}

function* clickCard() {
  try {
    const {
      mode,
      phase,
    } = yield select((state) => state);
    if (mode === modes.HUMAN) {
      yield call(selectCard, phase);
    }
    yield put({
      type: t.HEARTS_CLICK_CARD_SUCCESS,
    });
  } catch (error) {
    const errorMessage = _.get(error, 'message');
    yield put({
      type: t.HEARTS_CLICK_CARD_FAILURE,
      payload: { error: errorMessage },
    });
  }
}

function* keyDown({ payload }) {
  try {
    const {
      mode,
      phase,
      gameStatus,
    } = yield select((state) => state);
    switch (mode) {
      case modes.REPLAY: {
        if (gameStatus === gameImmediateStatus.PAUSED) {
          if (payload === 'ArrowLeft') {
            yield put({
              type: t.HEARTS_UNDO_GAME,
            });
          } else if (payload === 'ArrowRight') {
            yield put({
              type: t.HEARTS_REDO_GAME,
            });
          }
        }
        break;
      }
      case modes.HUMAN: {
        if ([e.PASS_CARDS, e.YOUR_TURN].indexOf(phase) > -1) {
          switch (payload) {
            case 'ArrowLeft':
              yield put({
                type: t.HEARTS_HIGHLIGHT_CARD,
                payload: 1,
              });
              break;
            case 'ArrowRight':
              yield put({
                type: t.HEARTS_HIGHLIGHT_CARD,
                payload: -1,
              });
              break;
            case 'ArrowUp':
              yield call(selectCard, phase);
              break;
            case 'Enter':
              if (phase === e.PASS_CARDS) {
                yield put({
                  type: t.HEARTS_PASS_CARDS,
                });
              }
              break;
            default:
          }
        }
        break;
      }
      default:
    }
    yield put({
      type: t.HEARTS_KEY_DOWN_SUCCESS,
    });
  } catch (error) {
    const errorMessage = _.get(error, 'message');
    yield put({
      type: t.HEARTS_KEY_DOWN_FAILURE,
      payload: { error: errorMessage },
    });
  }
}

function* passCards() {
  try {
    const {
      mode,
      dealNumber,
      cardList,
      selectedCards,
    } = yield select((state) => state);
    if (mode !== modes.HUMAN) {
      return;
    }
    worker.send({
      eventName: e.PASS_MY_CARDS,
      data: {
        dealNumber,
        cards: selectedCards.map((id) => {
          const card = cardList[id];
          return `${card.num}${card.suit}`;
        }),
      },
    });
    yield put({
      type: t.HEARTS_PASS_CARDS_SUCCESS,
    });
  } catch (error) {
    const errorMessage = _.get(error, 'message');
    yield put({
      type: t.HEARTS_PASS_CARDS_FAILURE,
      payload: { error: errorMessage },
    });
  }
}

function* pickCard() {
  try {
    const {
      cardList,
      selectedCards,
      dealNumber,
      roundNumber,
    } = yield select((state) => state);
    const pickedCard = cardList[selectedCards[0]];
    worker.send({
      eventName: e.PICK_CARD,
      data: {
        dealNumber,
        roundNumber,
        turnCard: `${pickedCard.num}${pickedCard.suit}`,
      },
    });
    yield put({
      type: t.HEARTS_PICK_CARD_SUCCESS,
    });
  } catch (error) {
    const errorMessage = _.get(error, 'message');
    yield put({
      type: t.HEARTS_PICK_CARD_FAILURE,
      payload: { error: errorMessage },
    });
  }
}

function* closeGame() {
  try {
    worker.send({ eventName: e.CLOSE_GAME });
    yield put({
      type: t.HEARTS_CLOSE_GAME_SUCCESS,
    });
  } catch (error) {
    const errorMessage = _.get(error, 'message');
    yield put({
      type: t.HEARTS_CLOSE_GAME_SUCCESS,
      payload: { error: errorMessage },
    });
  }
}

export function* init() {
  try {
    const { timeout } = yield race({
      init: call(initAll),
      timeout: call(delay, 15000), // timeout threshold 15 sec
    });

    /**
     * TODO: Redirect to signout or error page
     * 1. 15 seconds timeout
     * 2. invalid token
     */
    if (timeout) {
      throw new Error('Timeout Error');
    }
    yield put({
      type: t.HEARTS_INIT_SUCCESS,
    });
  } catch (error) {
    const errorMessage = _.get(error, 'message', error);
    yield put({
      type: t.HEARTS_INIT_FAILURE,
      payload: { error: errorMessage },
    });
  } finally {
    // Prevent browser from loading a drag-and-dropped file
    // http://stackoverflow.com/questions/6756583/prevent-browser-from-loading-a-drag-and-dropped-file
    window.addEventListener('dragover', (event) => {
      event.preventDefault();
    }, false);
    window.addEventListener('drop', (event) => {
      event.preventDefault();
    }, false);
  }
}

export function* process() {
  yield all([
    takeLatest(t.HEARTS_SET_LAYOUT_RATIO, setLayoutRatio),
    takeLatest(t.HEARTS_JOIN, join),
    takeLatest(t.HEARTS_CLICK_CARD, clickCard),
    takeLatest(t.HEARTS_KEY_DOWN, keyDown),
    takeLatest(t.HEARTS_PASS_CARDS, passCards),
    takeLatest(t.HEARTS_PICK_CARD, pickCard),
    takeLatest(t.HEARTS_CLOSE_GAME, closeGame),
  ]);
}
