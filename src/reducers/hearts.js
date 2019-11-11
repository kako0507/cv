import _ from 'lodash';
import {
  modes,
  gameImmediateStatus,
  dealInitData,
  gameInitData,
  playerPositions,
  southPlayerIndex,
  preparationPhases,
  ignoreUndoPhases,
  slowMotionPhases,
  maxCardSelection,
  gameLayout,
} from '../constants/hearts/game';
import t from '../constants/hearts/action-types';
import e from '../constants/hearts/event-types';
import { getUserInfo } from '../utils/hearts';
import createReducer from './create-reducer';

const initialState = {
  isInitializing: true,
  error: null,
};

const suitSort = ['D', 'C', 'H', 'S'];
const numberSort = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const positionTypes = _.mapKeys([
  'PLAYED',
  'WAIT_TO_COLLECT',
  'COLLECTED',
], (value) => value);

const playedCardPositionSample = [
  { rotation: 3, x: 8, y: 32 },
  { rotation: 135, x: 40, y: 52 },
  { rotation: 10, x: 0, y: -28 },
  { rotation: -120, x: -36, y: 72 },
];

/**
 * @param {object} layout
 * @param {boolean} isVertical
 * Is the element vertical ?
 * @param {string} type
 * Which type of element is needed to show ?
 */
function getTranslateY({
  layout: { layoutDetail },
  isVertical,
  type,
}) {
  let cardOffset = (
    layoutDetail.rowMargin
        + layoutDetail.cardHeight / 2
  );
  switch (type) {
    case 'PLAYER_INFO':
      cardOffset += (
        layoutDetail.cardHeight
            + layoutDetail.scoreHeight
            + layoutDetail.playerInfoFontSize
            + layoutDetail.playerInfoMargin
      ) / 2
        + layoutDetail.playerInfoMargin * 3;
      break;
    case 'PLAYER_INFO_CARD_SELECTED':
      cardOffset += (
        layoutDetail.cardHeight
            + layoutDetail.scoreHeight
            + layoutDetail.playerInfoFontSize
            + layoutDetail.playerInfoMargin
      ) / 2
        + layoutDetail.playerInfoMargin * 3
        + layoutDetail.cardSep;
      break;
    case 'COLLECTED_CARDS':
      cardOffset *= -1;
      break;
    case 'SCORE_CARDS':
      cardOffset += (
        layoutDetail.cardHeight / 2
            + layoutDetail.scoreHeight
            + layoutDetail.playerInfoFontSize
            + layoutDetail.suitSize
            + layoutDetail.playerInfoMargin * 5
            + 4
      );
      if (isVertical) {
        cardOffset += (
          layoutDetail.scoreWidth
                - layoutDetail.scoreHeight
                + layoutDetail.playerInfoMargin * 2
        );
      }
      break;
    default:
  }
  return (isVertical
    ? (
      window.innerWidth / 2
            - cardOffset
    )
    : (
      window.innerHeight / 2
            - cardOffset
    )
  );
}

// get the index of the player by playerName/playerNumber
function getPlayerIndex(players, value, ignoreCheck) {
  const playerProperty = (typeof value === 'number')
    ? 'playerNumber'
    : 'playerName';
  const playerIndex = _.findIndex(players, (player) => player[playerProperty] === value);
  if (!ignoreCheck && playerIndex === -1) {
    throw Error('Players list has been changed!');
  }
  return playerIndex;
}

// get the difference of index between the player with south player
function getPlayerIndexDiffFromSouth(playerIndex) {
  return (playerIndex - southPlayerIndex + 4) % 4;
}

// get the index of the player by card ID
function getPlayerIndexByCard(handCardGroups, cardId) {
  const index = _.findKey(handCardGroups, (hands) => hands.indexOf(cardId) > -1);
  return index === undefined ? undefined : Number(index);
}

function updatePlayerInfos(players, newPlayerInfos) {
  return players.map((player, playerIndex) => {
    const newPlayerInfo = newPlayerInfos.find(
      (p) => p.playerNumber === player.playerNumber,
    ) || {};

    return {
      ...player,
      ...newPlayerInfo,
      roundCard: newPlayerInfo.roundCard || '',
      gameScore: _.size(player.dealsInfo) === 4
        ? player.gameScore
        : newPlayerInfo.gameScore,
      playerIndex,
    };
  });
}

function sortCards(cardIds, cardList, player) {
  return _.sortBy(cardIds, (cardId) => _.multiply(
    getPlayerIndexDiffFromSouth(player) === 2 ? 1 : -1,
    _.sum([
      _.findIndex(suitSort, (suit) => suit === cardList[cardId].suit) * 13,
      _.findIndex(numberSort, (num) => num === cardList[cardId].num),
    ]),
  ));
}

function setClickableCards(cardList, candidateCards) {
  return cardList.map((card) => {
    let clickable = true;
    if (card.playerIndex === southPlayerIndex) {
      if (!candidateCards || candidateCards.indexOf(card.id) > -1) {
        clickable = true;
      } else {
        clickable = false;
      }
    } else if (card.clickable) {
      clickable = false;
    } else {
      return card;
    }

    return {
      ...card,
      clickable,
    };
  });
}

// get the postion of the card
function setCardPosition({
  layout,
  mode,
  playerIndex,
  turnIndex,
  groupCardCount,
  cardOrder,
  isSelected,
  positionType,
}) {
  const {
    layoutDetail,
    playedCardPosSample,
  } = layout;
  const indexDiffFromSouth = getPlayerIndexDiffFromSouth(playerIndex);
  const isVertical = indexDiffFromSouth % 2;
  const reverse = indexDiffFromSouth === 2
    ? -1 : 1;
  let zIndex = 52 + 13 - cardOrder;
  let rotation = indexDiffFromSouth === 0
    ? 0
    : (2 - indexDiffFromSouth) * 90;

  let left;
  let x;
  let y;
  let rotateY;

  switch (positionType) {
    case positionTypes.PLAYED: {
      ({ rotation, x, y } = playedCardPosSample[indexDiffFromSouth]);
      zIndex = 52 + turnIndex;
      rotateY = 0;
      break;
    }
    case positionTypes.COLLECTED:
      x = 0;
      y = reverse * getTranslateY({
        layout,
        isVertical,
        type: 'COLLECTED_CARDS',
      });
      zIndex = 65;
      rotateY = 0;
      break;
    default:
      left = -cardOrder;
      x = (left + groupCardCount / 2 - 0.5) * layoutDetail.cardSep;
      y = getTranslateY({
        layout,
        isVertical,
      });
      if (isSelected) {
        y -= layoutDetail.cardSep;
      }

      zIndex = 52 + (reverse === -1
        ? cardOrder + 1
        : 13 - cardOrder
      );

      if (positionType === positionTypes.WAIT_TO_COLLECT) {
        if (indexDiffFromSouth === 2) {
          y -= layoutDetail.cardSep;
        } else {
          y += layoutDetail.cardSep;
        }
        zIndex += 13;
        rotateY = 0;
      } else {
        rotateY = (playerIndex === southPlayerIndex)
          ? 0
          : 180;
      }

      x *= reverse;
      y *= reverse;
  }

  if (mode !== modes.HUMAN) {
    rotateY = 0;
  }

  return {
    x,
    y,
    zIndex,
    rotation,
    rotateY, // show player's card
  };
}

// set the position of the card
function setCardsPosition({
  layout,
  mode,
  cardList,
  handCardGroups,
  player,
  selectedCards,
  unselectedCards,
  roundPlayers,
  rerenderAllCards,
  ...params
}) {
  const roundTrick = Array.isArray(params.roundTrick) && sortCards(params.roundTrick, cardList);
  return cardList.map((card) => {
    const { id, playerIndex } = card;
    let order;
    let param;

    if (Array.isArray(roundTrick) && roundTrick.indexOf(id) > -1) {
      const indexDiffFromSouth = getPlayerIndexDiffFromSouth(playerIndex);
      if (indexDiffFromSouth === 2) {
        order = [...roundTrick].reverse().indexOf(id);
      } else {
        order = roundTrick.indexOf(id);
      }

      param = {
        layout,
        mode,
        playerIndex: player,
        cardOrder: order,
        groupCardCount: 4,
        positionType: positionTypes.WAIT_TO_COLLECT,
      };
    } else if (card.collected) {
      // This card has been played in previous round, put it out of the window.
      param = {
        layout,
        mode,
        playerIndex,
        cardOrder: 0,
        positionType: positionTypes.COLLECTED,
      };
    } else if (card.played) {
      if (roundPlayers) {
        const roundPlayer = roundPlayers[0];
        const turnIndex = roundPlayers.indexOf(playerIndex);
        // This card has been played in this round, put it to board center.
        param = {
          layout,
          mode,
          playerIndex,
          turnIndex,
          roundPlayer,
          cardOrder: 0,
          positionType: positionTypes.PLAYED,
        };
      }
    } else if (handCardGroups) {
      const groupCardCount = handCardGroups[playerIndex].length;
      const cardOrder = _.findIndex(handCardGroups[playerIndex], (cardId) => cardId === id);
      let isSelected;
      if (selectedCards) {
        isSelected = selectedCards.indexOf(id) > -1;
        if (_.every([
          !rerenderAllCards,
          !isSelected,
          unselectedCards?.indexOf(id) === -1,
        ])) {
          // only re-render selected or cancelled cards.
          return card;
        }
      }
      param = {
        layout,
        mode,
        playerIndex,
        groupCardCount,
        cardOrder,
        isSelected,
      };
    }
    if (!param) {
      return card;
    }
    return {
      ...card,
      pos: setCardPosition(param),
    };
  });
}

const setScoreCardsPosition = ({
  layout,
  scoreCards,
}) => scoreCards.map((scoreCard, i) => {
  const indexDiffFromSouth = getPlayerIndexDiffFromSouth(scoreCard.playerIndex);
  const isVertical = indexDiffFromSouth % 2;
  const rotation = indexDiffFromSouth === 0
    ? 0
    : (2 - indexDiffFromSouth) * 90;
  const reverse = indexDiffFromSouth === 2
    ? -1 : 1;
  return {
    ...scoreCard,
    pos: {
      x: (
        reverse
                * (
                  scoreCards.length / 2
                    - (indexDiffFromSouth === 2
                      ? (scoreCards.length - i - 1)
                      : i
                    )
                    - 0.5
                )
                * (layout.layoutDetail.suitSize + 14)
      ),
      y: reverse * getTranslateY({
        layout,
        isVertical,
        type: 'SCORE_CARDS',
      }),
      rotation,
    },
  };
});

const setScoreCardsPositionByPlayers = (layout, players) => {
  if (players.length !== 4) {
    return [];
  }
  return players
    .map((player, playerIndex) => {
      const scoreCards = (player.scoreCards || []).map((scoreCard) => ({
        playerIndex,
        value: scoreCard,
        num: scoreCard[0],
        suit: scoreCard[1],
      }));
      return setScoreCardsPosition({
        layout,
        playerIndex,
        scoreCards,
      });
    })
    .reduce((scoreCards1, scoreCards2) => ([
      ...scoreCards1,
      ...scoreCards2,
    ]));
};

const rotatePlayerIndex = (playerIndex, offset = 1) => (
  playerIndex === -1
    ? -1
    : (Number(playerIndex) + offset) % 4
);

function sortPlayers(players, offset = 1) {
  return _.sortBy(
    players,
    ({ playerIndex }) => (
      (playerIndex + offset + 4) % 4
    ),
  ).map(
    (player, playerIndex) => ({ ...player, playerIndex }),
  );
}

const rotatePlayers = (
  {
    players,
    scoreCards,
    handCardGroups,
    playedCardGroups,
    roundPlayers,
    turnPlayer,
    prevTurnPlayer,
    prevRoundInfo,
    ...state
  },
  offset,
) => {
  const cardList = state.cardList.map((card) => ({
    ...card,
    playerIndex: rotatePlayerIndex(card.playerIndex, offset),
  }));
  return {
    players: sortPlayers(players, offset),
    cardList,
    scoreCards: scoreCards.map((card) => ({
      ...card,
      playerIndex: rotatePlayerIndex(card.playerIndex, offset),
    })),
    handCardGroups: _.mapValues(
      _.mapKeys(
        handCardGroups,
        (cards, playerIndex) => rotatePlayerIndex(playerIndex, offset),
      ),
      (hands, playerIndex) => sortCards(hands, cardList, playerIndex),
    ),
    playedCardGroups: _.mapKeys(
      playedCardGroups,
      (cards, playerIndex) => rotatePlayerIndex(playerIndex, offset),
    ),
    roundPlayers: roundPlayers?.map(
      (roundPlayer) => rotatePlayerIndex(roundPlayer, offset),
    ),
    turnPlayer: rotatePlayerIndex(turnPlayer, offset),
    prevTurnPlayer: rotatePlayerIndex(prevTurnPlayer, offset),
    prevRoundInfo: {
      ...prevRoundInfo,
      roundPlayer: rotatePlayerIndex(prevRoundInfo.roundPlayer, offset),
    },
  };
};

const setPlayersInfoPosition = ({
  layout,
  players,
  isCardSelected,
}) => (
  players.map((player, playerIndex) => {
    const indexDiffFromSouth = getPlayerIndexDiffFromSouth(playerIndex);
    return {
      ...player,
      infoPos: {
        rotation: playerIndex === southPlayerIndex
          ? 0
          : (2 - indexDiffFromSouth) * 90,
        y: (indexDiffFromSouth === 2 ? -1 : 1) * getTranslateY({
          layout,
          isVertical: indexDiffFromSouth % 2,
          type: (isCardSelected && playerIndex === southPlayerIndex)
            ? 'PLAYER_INFO_CARD_SELECTED'
            : 'PLAYER_INFO',
        }),
      },
    };
  })
);

const setAllElementsPosition = (
  state,
  { layoutRatio, init, undo },
) => {
  /* layout relative properties {{{ */
  const layoutDetail = _.mapValues(gameLayout, (value) => value * (layoutRatio || 1));
  const playedCardPosSample = playedCardPositionSample.map(
    (sample) => ({
      ...sample,
      x: sample.x * layoutRatio,
      y: sample.y * layoutRatio,
    }),
  );
  const layout = {
    layoutDetail,
    layoutRatio,
    playedCardPosSample,
  };

  const newState = {
    ...state,
    layout,
    playedCardPosSample,
  };
    /* }}} */

  if (init === true) {
    return newState;
  }

  const {
    phase,
    selectedCards,
    scoreCards,
    players,
  } = newState;
  const maxCard = maxCardSelection[phase];
  let { cardList } = newState;

  if (undo || (phase && preparationPhases.indexOf(phase) === -1)) {
    cardList = setCardsPosition({
      ..._.pick(newState, [
        'layout',
        'mode',
        'cardList',
        'handCardGroups',
        'selectedCards',
        'roundPlayers',
      ]),
      rerenderAllCards: true,
    });
  }

  return {
    layout,
    cardList,
    players: players?.length
      ? setPlayersInfoPosition({
        layout,
        players,
        isCardSelected: maxCard && selectedCards.length > 0,
      })
      : [],
    scoreCards: scoreCards?.length
      ? _.union(
        ..._.map(
          _.groupBy(scoreCards, ({ playerIndex }) => playerIndex),
          (cards) => setScoreCardsPosition({
            layout,
            scoreCards: cards,
          }),
        ),
      )
      : [],
    slowMotion: false,
  };
};

const humanEventHandler = (handler) => (
  (payload, state) => {
    if (state.mode !== modes.HUMAN) {
      return {};
    }
    return handler(payload, state);
  }
);

// handlers of events from web worker server
const eventHandler = {
  [e.GAME_PREPARE]: ({ countDown }) => ({
    ...dealInitData,
    ...gameInitData,
    countDown,
  }),
  [e.NEW_GAME]: (
    payload,
    { layout, gameScoreInfo },
  ) => {
    let { players } = payload;

    // Add position infomation
    players = players.map((player, playerIndex) => ({
      ...player,
      ...((gameScoreInfo && gameScoreInfo[playerIndex]) || {}),
      pos: playerPositions[playerIndex],
      playerIndex,
    }));

    const { playerNumber } = getUserInfo();
    if (playerNumber > 0) {
      const southPlayerOriginIndex = getPlayerIndex(
        players,
        playerNumber,
        true,
      );
      if (southPlayerOriginIndex !== -1) {
        // Sort players to let user in south side
        players = sortPlayers(players, southPlayerIndex - southPlayerOriginIndex);
      }
    }

    return {
      gameStatus: gameImmediateStatus.PREPARING,
      players: setPlayersInfoPosition({
        layout,
        players,
      }),
    };
  },
  [e.NEW_DEAL]: (
    { dealNumber, self, ...payload },
    {
      layout, gameStatus, mode, cardList, ...state
    },
  ) => {
    const players = updatePlayerInfos(
      state.players,
      payload.players,
    );
    const cardGroups = _.cloneDeep(players.map((player) => player.cards));

    return {
      dealNumber,
      players,
      isGetCardListDone: true,
      gameStatus: gameStatus === gameImmediateStatus.PAUSED
        ? gameImmediateStatus.PAUSED
        : gameImmediateStatus.ONGOING,
      // Set player card values
      cardList: cardList.map((card) => {
        if (mode === modes.HUMAN && card.playerIndex !== southPlayerIndex) {
          return card;
        }
        let value;
        if (mode !== modes.HUMAN) {
          const cards = cardGroups[card.playerIndex] || [];
          if (cards?.length) {
            ([value] = cards.splice(_.random(cards.length - 1), 1));
          }
        } else {
          value = self.cards[card.handCardIndex];
        }
        const [num, suit] = value;
        return {
          ...card,
          num,
          suit,
          value,
          clickable: mode === modes.HUMAN,
        };
      }),
    };
  },
  [e.PASS_CARDS_END]: (
    payload,
    { layout, mode, ...state },
  ) => {
    let { cardList, handCardGroups } = state;
    if (mode === modes.HUMAN) {
      return {
        // Reset clickable cards
        cardList: setClickableCards(cardList),
      };
    }

    const players = updatePlayerInfos(
      state.players,
      payload.players,
    );

    const pickedCardGroups = players.map((player) => (
      player.pickedCards.map(
        (pickedCard) => cardList.find((card) => card.value === pickedCard).id,
      )
    ));
    const recievedCardGroups = players.map((player) => (
      player.receivedCards.map(
        (recievedCard) => cardList.find((card) => card.value === recievedCard).id,
      )
    ));

    handCardGroups = _.mapValues(
      // remove pickedCards
      _.mapValues(handCardGroups, (hands, i) => _.difference(hands, pickedCardGroups[i])),
      // add receivedCards from senders
      (hands, i) => _.union(hands, recievedCardGroups[i]),
    );

    cardList = cardList.map((card) => {
      // Update card owner after pass cards
      const playerIndex = getPlayerIndexByCard(handCardGroups, card.id);
      if (playerIndex === undefined || playerIndex === card.playerIndex) {
        return card;
      }

      return {
        ...card,
        playerIndex,
        received: recievedCardGroups[playerIndex].indexOf(card.id) !== -1,
      };
    });

    return {
      handCardGroups,
      // Reset position of cards to let them moving
      cardList: setCardsPosition({
        layout,
        mode,
        cardList,
        handCardGroups,
      }),
    };
  },
  [e.NEW_ROUND]: (
    { dealNumber, roundNumber, ...payload },
    {
      layout, cardList, handCardGroups, ...state
    },
  ) => {
    const players = updatePlayerInfos(
      state.players,
      payload.players,
    );

    // Set player index of round players in order
    const roundPlayers = payload.roundPlayers.map(
      (playerName) => getPlayerIndex(players, playerName),
    );

    return {
      players,
      scoreCards: setScoreCardsPositionByPlayers(layout, players),
      roundNumber,
      roundPlayers,
      turnPlayer: roundPlayers[0],
    };
  },
  [e.TURN_END]: (
    {
      roundNumber,
      turnPlayer,
      turnCard,
      serverRandom,
      ...payload
    },
    { layout, mode, ...state },
  ) => {
    const players = updatePlayerInfos(
      state.players,
      payload.players,
    );
    const roundPlayers = payload.roundPlayers.map(
      (playerName) => getPlayerIndex(players, playerName),
    );
    const turnPlayerIndex = getPlayerIndex(players, turnPlayer);
    const nextTurnPlayerIndex = (turnPlayerIndex + 1) % 4;

    const playedCardValues = players
      .map(({ roundCard }) => roundCard);

    let { cardList, handCardGroups, playedCardGroups } = state;
    let timeout = false;
    let error = false;

    if (serverRandom) {
      if (
        players[turnPlayerIndex].errorCount
                === state.players[turnPlayerIndex].errorCount + 1
      ) {
        error = true;
      } else {
        timeout = true;
      }
    }


    if (state.roundPlayers) {
      handCardGroups = _.mapValues(handCardGroups, (hands, playerIndex) => {
        if (Number(playerIndex) === turnPlayerIndex) {
          // Get card object
          const turnCardInfo = cardList.find((card) => card.value === turnCard);
          let index;
          if (turnCardInfo) {
            index = [turnCardInfo.id];
          } else {
            // Set turn card randomly if the card is invisible
            index = _.sampleSize(hands, 1);
          }
          playedCardGroups = {
            ...playedCardGroups,
            [playerIndex]: index,
          };
          // Set remain cards to hand cards
          const remainCards = _.difference(hands, playedCardGroups[playerIndex]);
          return remainCards;
        }
        return hands;
      });

      // Set played cards value
      cardList = cardList.map((card) => {
        if (card.id === playedCardGroups[turnPlayerIndex][0]) {
          const [num, suit] = turnCard;
          return {
            ...card,
            num,
            suit,
            timeout,
            error,
            value: turnCard,
            playedRound: roundNumber,
            played: true,
            clickable: false,
          };
        }
        return card;
      });
    } else {
      const collectedCardGroups = _.groupBy(
        cardList.filter(({ collected }) => collected),
        ({ playerIndex }) => playerIndex,
      );
      playedCardGroups = _.mapKeys(
        playedCardValues
          .map((roundCard, playerIndex) => {
            if (roundCard) {
              const roundCardInfo = cardList.find((card) => (
                roundCard === card.value
              ));
              if (roundCardInfo) {
                return [roundCardInfo.id];
              }
              if (turnPlayerIndex === playerIndex) {
                return _.sampleSize(handCardGroups[playerIndex], 1);
              }
              const roundCardObj = _.sample(collectedCardGroups[playerIndex]);
              return [roundCardObj.id];
            }
            return undefined;
          }),
        (value, key) => key,
      );

      // Set played cards value
      cardList = cardList.map((card) => {
        const isCardPlayed = _.find(
          playedCardGroups,
          (cards) => (cards && cards[0] === card.id),
        );
        if (isCardPlayed) {
          const value = playedCardValues[card.playerIndex];
          const [num, suit] = value;
          return {
            ...card,
            ...(value === turnCard
              ? {
                timeout,
                error,
              }
              : {}
            ),
            num,
            suit,
            value,
            playedRound: roundNumber,
            played: true,
            collected: false,
            clickable: false,
          };
        }
        return card;
      });

      handCardGroups = _.mapValues(handCardGroups, (hands, playerIndex) => {
        const value = playedCardValues[playerIndex];
        if (value) {
          // Get card object
          const turnCardInfo = cardList.find(
            (card) => card.value === value,
          );
          // Set remain cards to hand cards
          const remainCards = _.difference(hands, [turnCardInfo.id]);
          return remainCards;
        }
        return hands;
      });
    }

    // Reset position of cards to let them moving
    cardList = setCardsPosition({
      layout,
      mode,
      cardList,
      handCardGroups,
      roundPlayers,
    });

    return {
      cardList,
      handCardGroups,
      playedCardGroups,
      roundPlayers,
      prevTurnPlayer: turnPlayerIndex,
      turnPlayer: nextTurnPlayerIndex,
      highlightCard: undefined,
      candidateCards: undefined,
    };
  },
  [e.ROUND_END]: (
    { roundPlayer },
    { cardList, players, playedCardGroups },
  ) => {
    const playerIndex = getPlayerIndex(players, roundPlayer);
    let roundTrick;
    if (_.size(playedCardGroups) === 4) {
      roundTrick = _.map(playedCardGroups, (card) => card[0]);
    } else {
      roundTrick = _.map(playedCardGroups, (card) => card[0]);
    }

    return {
      cardList: cardList.map((card) => {
        if (roundTrick.indexOf(card.id) === -1) {
          return card;
        }
        return {
          ...card,
          playerIndex, // update card owner
          collected: true,
        };
      }),
      playedCardGroups: {},
      prevRoundInfo: {
        roundTrick,
        roundPlayer: playerIndex,
      },
      turnPlayer: playerIndex,
    };
  },
  [e.DEAL_END]: (
    { dealNumber, ...payload },
    { gameScoreInfo, ...state },
  ) => {
    let players = updatePlayerInfos(
      state.players,
      payload.players,
    );
    if (!gameScoreInfo) {
      players = players.map((player) => ({
        ...player,
        dealsInfo: {
          ...(player.dealsInfo || {}),
          [dealNumber]: {
            dealNumber,
            score: player.dealScore,
          },
        },
      }));
    }
    return {
      ...dealInitData,
      players,
    };
  },
  [e.GAME_END]: (
    { players },
    state,
  ) => ({
    players: _.sortBy(
      updatePlayerInfos(
        state.players,
        players,
      ).map((player) => ({
        ...player,
        dealsInfo: _.mapKeys(
          player.deals,
          ({ dealNumber }) => dealNumber,
        ),
      })),
      (player) => (-player.gameScore),
    ),
    gameStatus: gameImmediateStatus.STOPPED,
    showScoreBoard: state.mode !== modes.REPLAY
      ? true
      : state.showScoreBoard,
  }),
  [e.HISTORY]: (eventHistory) => ({
    eventHistory,
  }),

  /* Human player event handlers {{{ */
  [e.PASS_CARDS]: humanEventHandler((
    { receiver },
    { players },
  ) => ({
    passCardReceiver: getPlayerIndex(players, receiver),
    selectedCards: [],
  })),
  [e.RECEIVE_OPPONENT_CARDS]: humanEventHandler((
    { self: { pickedCards, receivedCards, receivedFrom } },
    {
      mode, layout, players, ...state
    },
  ) => {
    // get sender player index
    const senderIndex = getPlayerIndex(players, receivedFrom);
    const senderDiff = getPlayerIndexDiffFromSouth(senderIndex);
    const recievedCardGroups = {};
    let { cardList, handCardGroups } = state;
    handCardGroups = _.mapValues(
      _.mapValues(handCardGroups, (hands, i) => {
        let pickedCardIds;
        if (Number(i) === southPlayerIndex) {
          // Set pickedCards to previous saved data if player is human
          pickedCardIds = cardList.filter(
            (card) => (card.value && pickedCards.indexOf(card.value) > -1),
          ).map(({ id }) => id);
        } else {
          // Set pickedCards randomly
          pickedCardIds = _.sampleSize(hands, 3);
        }
        // Receiver player index: (4 + i - senderDiff) % 4
        recievedCardGroups[(4 + i - senderDiff) % 4] = pickedCardIds;
        // remove pickCards in this hand cards group
        return _.difference(hands, pickedCardIds);
      }),
      // add pickCards from senders
      (hands, i) => _.union(hands, recievedCardGroups[i]),
    );

    cardList = cardList.map((card) => {
      // Update card owner after pass cards
      const playerIndex = getPlayerIndexByCard(handCardGroups, card.id);
      // Set receivedCards value of human's hand card
      const index = recievedCardGroups[southPlayerIndex].indexOf(card.id);
      if (_.every([
        index === -1,
        (playerIndex === undefined || playerIndex === card.playerIndex),
      ])) {
        return card;
      }
      if (card.value && playerIndex !== southPlayerIndex) {
        return {
          ...card,
          playerIndex,
          num: undefined,
          suit: undefined,
          value: undefined,
        };
      }
      if (index > -1) {
        const value = receivedCards[index];
        const [num, suit] = receivedCards[index];
        return {
          ...card,
          playerIndex,
          num,
          suit,
          value,
          received: true,
          clickable: false,
        };
      }
      return {
        ...card,
        playerIndex,
      };
    });

    return {
      handCardGroups,
      // Reset position of cards to let them moving
      cardList: setCardsPosition({
        mode,
        layout,
        cardList,
        handCardGroups,
      }),
    };
  }),
  [e.YOUR_TURN]: humanEventHandler((
    payload,
    {
      mode,
      layout,
      cardList,
      handCardGroups,
      players,
      ...state
    },
  ) => {
    let { selectedCards } = state;
    let { self: { candidateCards } } = payload;

    if (!Array.isArray(candidateCards)) {
      return {};
    }

    // Map card values of candidateCards to card IDs
    candidateCards = candidateCards.map(
      (c) => cardList.find((card) => card.value === c).id,
    );

    // Remove non-candidate cards in selectedCards
    selectedCards = _.intersection(
      candidateCards,
      selectedCards,
    );

    return {
      cardList: (
      // Reset clickable cards
        setClickableCards(
          // Reset position of cards to let them moving
          setCardsPosition({
            mode,
            layout,
            cardList,
            handCardGroups,
            selectedCards,
          }),
          candidateCards,
        )
      ),
      players: selectedCards.length
        ? setPlayersInfoPosition({
          layout,
          players,
          isCardSelected: true,
        })
        : players,
      highlightCard: selectedCards[0],
      candidateCards,
    };
  }),
  /* Human player event handlers }}} */

  /* Resuming mechanism {{{ */
  [e.JOIN]: (payload, state) => {
    const {
      dealNumber,
      roundNumber,
    } = payload;
    const {
      layout,
      mode,
    } = state;
    const newGameEventState = eventHandler[e.NEW_GAME](payload, state);
    const { players } = newGameEventState;
    const handCardValueGroups = players.map(({ cards }) => cards);
    let {
      cardList, handCardGroups, scoreCards, gameStatus,
    } = state;
    if (_.every([
      handCardValueGroups.length,
      handCardValueGroups.reduce((cards1, cards2) => ([
        ...(cards1 || []),
        ...(cards2 || []),
      ])).length,
    ])) {
      const collectedCardGroups = _.mapValues(handCardGroups, (hands, playerIndex) => (
        hands.slice(players[playerIndex].cardsCount, hands.length)
      ));
      handCardGroups = _.mapValues(handCardGroups, (hands, playerIndex) => (
        hands.slice(0, players[playerIndex].cardsCount)
      ));

      cardList = cardList.map((card) => {
        const { id, playerIndex } = card;
        const cards = handCardValueGroups[playerIndex];
        if (!cards && collectedCardGroups[playerIndex].indexOf(id) === -1) {
          return card;
        }
        if (!cards?.length) {
          return {
            ...card,
            collected: true,
          };
        }
        const value = cards.splice(0, 1)[0];
        const [num, suit] = value;
        return {
          ...card,
          num,
          suit,
          value,
        };
      });
      handCardGroups = _.mapValues(
        handCardGroups,
        (hands, playerIndex) => sortCards(hands, cardList, playerIndex),
      );
      cardList = setCardsPosition({
        mode,
        layout,
        cardList,
        handCardGroups,
      });
      gameStatus = gameImmediateStatus.ONGOING;
      scoreCards = setScoreCardsPositionByPlayers(layout, players);
    }

    return {
      ...newGameEventState,
      dealNumber,
      roundNumber,
      cardList,
      handCardGroups,
      scoreCards,
      gameStatus,
      players: setPlayersInfoPosition({
        layout,
        players,
      }),
    };
  },
  /* Resuming mechanism }}} */
};

export default createReducer(initialState, {
  [t.HEARTS_INIT]: () => dealInitData,

  [t.HEARTS_JOIN]: () => ({
    phase: e.JOIN,
  }),

  [t.HEARTS_JOIN_SUCCESS]: (state, payload) => ({
    ...payload,
  }),

  [t.HEARTS_PASS_CARDS_SUCCESS]: ({ layout, players }) => ({
    phase: e.PASS_MY_CARDS,
    players: setPlayersInfoPosition({
      layout,
      players,
      isCardSelected: false,
    }),
    selectedCards: [],
  }),

  [t.HEARTS_PICK_CARD_SUCCESS]: (
    { layout, cardList, players },
  ) => ({
    phase: e.PICK_CARD,
    players: setPlayersInfoPosition({
      layout,
      players,
      isCardSelected: false,
    }),
    selectedCards: [],
    cardList: setClickableCards(cardList),
  }),

  [t.HEARTS_CLOSE_GAME_SUCCESS]: () => ({
    ...dealInitData,
    ...gameInitData,
    gameStatus: gameImmediateStatus.STOPPED,
  }),

  [t.HEARTS_PAUSE_GAME_SUCCESS]: () => ({
    gameStatus: gameImmediateStatus.PAUSED,
    disableManualAction: false,
  }),

  [t.HEARTS_RESUME_GAME_SUCCESS]: () => ({
    gameStatus: gameImmediateStatus.ONGOING,
  }),

  [t.HEARTS_UNDO_GAME_MEM]: (
    {
      gameHistory,
      layout,
      ...state
    },
  ) => {
    const playerNumbers = state.players.map(({ playerNumber }) => playerNumber);
    const present = gameHistory[gameHistory.length - 2];
    const newGameHistory = gameHistory.slice(0, gameHistory.length - 1);
    const { players } = present;
    let newState = { ...state, ...present };

    if (_.every([
      players?.length === 4,
      playerNumbers?.length === 4,
      players[0].playerNumber !== playerNumbers[0],
    ])) {
      const offset = playerNumbers.indexOf(players[0].playerNumber);
      newState = {
        ...newState,
        ...rotatePlayers(newState, offset),
      };
    }

    newState = {
      ...newState,
      handCardGroups: _.mapValues(
        newState.handCardGroups,
        (hands, playerIndex) => sortCards(hands, newState.cardList, playerIndex),
      ),
    };

    return {
      ...newState,
      ...([
        e.NEW_GAME,
        e.DEAL_END,
      ].indexOf(present.phase) === -1
        ? setAllElementsPosition(
          newState,
          {
            layoutRatio: layout.layoutRatio,
            undo: true,
            playerNumbers,
          },
        )
        : {}
      ),
      ...([
        e.NEW_GAME,
        e.DEAL_END,
      ].indexOf(present.phase) !== -1
        ? {
          players: setPlayersInfoPosition({
            layout,
            players: newState.players,
          }),
        }
        : {}
      ),
      gameHistory: newGameHistory,
      disableManualAction: false,
    };
  },

  [t.HEARTS_REMOVE_COUNT_DOWN]: () => ({
    countDown: undefined,
  }),

  [t.HEARTS_TOGGLE_SCORES]: ({ showScoreBoard }) => ({
    showScoreBoard: !showScoreBoard,
  }),

  [t.HEARTS_DISTRIBUTE_CARDS]: (
    {
      layout,
      mode,
      cardList,
      handCardGroups,
      ...state
    },
    count,
  ) => {
    let { phase, tempPhase } = state;

    if (count === 52) {
      if (phase === e.DISTRIBUTE_CARDS) {
        phase = tempPhase;
      }
    } else {
      tempPhase = phase;
      phase = e.DISTRIBUTE_CARDS;
    }
    return {
      ...state,
      phase,
      tempPhase,
      cardList: cardList.map((card) => {
        const { id, playerIndex } = card;
        if ((id + 1) > count) {
          // keep original position if card hasn't been dealed.
          return card;
        }
        const groupCardCount = Math.ceil(count / 4);
        const cardOrder = _.findIndex(handCardGroups[playerIndex], (cardId) => cardId === id);

        return {
          ...card,
          pos: setCardPosition({
            layout,
            mode,
            playerIndex,
            groupCardCount,
            cardOrder,
          }),
        };
      }),
    };
  },
  [t.HEARTS_SORT_CARDS]: (
    { mode, layout, ...state },
  ) => {
    let { cardList, handCardGroups } = state;
    handCardGroups = _.mapValues(
      handCardGroups,
      (hands, playerIndex) => sortCards(hands, cardList, playerIndex),
    );
    cardList = setCardsPosition({
      mode,
      layout,
      cardList,
      handCardGroups,
    });
    return {
      ...state,
      cardList,
      handCardGroups,
    };
  },

  [t.HEARTS_HOVER_CARD]: (
    { mode },
    card,
  ) => {
    if (mode === modes.HUMAN) {
      return {
        highlightCard: card,
      };
    }
    return undefined;
  },

  [t.HEARTS_HIGHLIGHT_CARD]: (
    {
      layout,
      mode,
      phase,
      cardList,
      handCardGroups,
      candidateCards,
      highlightCard,
      ...state
    },
    offset,
  ) => {
    if (mode === modes.HUMAN) {
      if ([e.PASS_CARDS, e.YOUR_TURN].indexOf(phase) > -1) {
        const handCards = sortCards(candidateCards || handCardGroups[southPlayerIndex], cardList);
        let highlightCardIndex = handCards.indexOf(highlightCard);
        let newHighlightCard;
        if (highlightCardIndex === -1) {
          ([newHighlightCard] = handCards);
        }
        highlightCardIndex += offset;
        if (highlightCardIndex >= 0 && highlightCardIndex < 13) {
          newHighlightCard = handCards[highlightCardIndex];
        }
        if (newHighlightCard !== undefined) {
          if (phase === e.YOUR_TURN) {
            const selectedCards = [newHighlightCard];
            let unselectedCards;
            if (selectedCards[0] !== newHighlightCard) {
              unselectedCards = state.selectedCards;
            }
            return {
              highlightCard: newHighlightCard,
              selectedCards,
              cardList: setCardsPosition({
                mode,
                layout,
                cardList,
                handCardGroups,
                selectedCards,
                unselectedCards,
              }),
            };
          }
          return {
            highlightCard: newHighlightCard,
          };
        }
      }
    }
    return undefined;
  },

  [t.HEARTS_SELECT_CARDS]: (
    {
      mode,
      layout,
      cardList,
      handCardGroups,
      players,
      phase,
      ...state
    },
    card,
  ) => {
    const maxCard = maxCardSelection[phase];
    const highlightCard = card === undefined ? state.highlightCard : card;
    let unselectedCard;
    let { selectedCards } = state;
    if (phase === e.PASS_CARDS && selectedCards.indexOf(highlightCard) > -1) {
      // it's already selected, so unselect it!
      unselectedCard = highlightCard;
    } else {
      selectedCards = _.union(selectedCards, [highlightCard]);
      if (selectedCards.length > (maxCard || 1)) {
        ([unselectedCard] = selectedCards);
      }
    }
    selectedCards = _.difference(selectedCards, [unselectedCard]);
    return {
      highlightCard,
      selectedCards,
      cardList: maxCard
        ? setCardsPosition({
          mode,
          layout,
          cardList,
          handCardGroups,
          selectedCards,
          unselectedCards: [unselectedCard],
        })
        : cardList,
      players: setPlayersInfoPosition({
        layout,
        players,
        isCardSelected: maxCard && selectedCards.length > 0,
      }),
    };
  },

  [t.HEARTS_SET_ROUND_TRICK_POS]: (
    {
      mode,
      layout,
      phase,
      cardList,
      prevRoundInfo,
    },
  ) => ({
    cardList: (phase === e.GAME_END || !prevRoundInfo)
      ? cardList
      : setCardsPosition({
        mode,
        layout,
        cardList,
        roundTrick: prevRoundInfo.roundTrick,
        player: prevRoundInfo.roundPlayer,
      }),
  }),
  [t.HEARTS_SET_COLLECTED_CARDS_POS]: (
    { mode, layout, cardList },
  ) => ({
    cardList: setCardsPosition({
      mode,
      layout,
      cardList,
    }),
  }),

  [t.HEARTS_ROTATE_PLAYERS]: (
    {
      layout: { layoutRatio },
      ...state
    },
  ) => {
    const updatedProperties = rotatePlayers(state);
    return {
      ...updatedProperties,
      ...setAllElementsPosition(
        {
          ...state,
          ...updatedProperties,
        },
        { layoutRatio },
      ),
      slowMotion: true,
    };
  },

  [t.HEARTS_SET_ALL_CARDS_POS]: setAllElementsPosition,

  [t.HEARTS_PARSE_EVENT]: (
    { phase, gameHistory, ...state },
    {
      eventName, data, sequenceNumber, replay,
    },
  ) => {
    const handler = eventHandler[eventName];
    if (!handler || !phase) {
      return {};
    }

    const updatedProperties = handler(data, state, eventName);
    if (!updatedProperties) {
      return {};
    }

    let newGameHistory = {};
    if (_.every([
      replay,
      gameHistory,
      ignoreUndoPhases.indexOf(eventName) === -1,
    ])) {
      const newPresent = {
        ...state,
        ...updatedProperties,
        phase: eventName,
        eventSequenceNumber: sequenceNumber,
      };
      if (newPresent !== gameHistory[gameHistory.length - 1]) {
        newGameHistory = {
          gameHistory: [...gameHistory, _.pick(newPresent, [
            'dealNumber',
            'phase',
            'eventSequenceNumber',
            'players',
            'cardList',
            'scoreCards',
            'handCardGroups',
            'playedCardGroups',
            'roundPlayers',
            'turnPlayer',
            'prevTurnPlayer',
            'prevRoundInfo',
          ])],
        };
      }
    }

    return {
      ...updatedProperties,
      ...newGameHistory,
      phase: eventName,
      eventSequenceNumber: sequenceNumber,
      disableManualAction: true,
      slowMotion: slowMotionPhases.indexOf(eventName) > -1,
    };
  },
  [t.HEARTS_PARSE_EVENT_SUCCESS]: () => ({
    disableManualAction: false,
  }),
  [t.HEARTS_PARSE_EVENT_FAILURE]: (state, eventErrorInfo) => ({
    eventErrorInfo,
  }),

  [t.HEARTS_RESET_HISTORY]: (state, gameHistory) => ({
    gameHistory,
  }),
});
