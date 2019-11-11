/* eslint-disable no-restricted-globals */
/* eslint-disable no-use-before-define */
import ensureArray from 'ensure-array';
import _ from 'lodash';
import {
  firstCard,
  doublePanaltyCard,
  pigCard,
  heartSuit,
  suits,
  numbers,
  penaltyCards,
} from '../../constants/hearts/playing-card';
import {
  maxPlayers,
  maxDeals,
  maxRounds,

  passCardOffset,
  watcherEvents,

  second,
  distributeTime,
  commandInterval,
  newRoundInterval,
  newDealInterval,
} from '../../constants/hearts/game';
import e from '../../constants/hearts/event-types';

const { warn, error } = console;

const boardChannel = new BroadcastChannel('board');

let players = [];
let roundPlayerIndexs = [];
let roundPlayers = [];
let eventHistory = [];
let watchMode = true;
let heartBroken = false;
let shootingTheMoon = false;
let dealNumber = 0;
let roundNumber = 0;
let passCount = 0;
let turnIndex = 0;

const delay = (ms) => new Promise((resolve) => {
  setTimeout(() => resolve(), ms);
});

const getPlayerIndex = (plrs, playerName) => _.findIndex(plrs, (player) => (
  player.playerName === playerName
));

const getPlayerInfo = (player, addtionProperties = []) => {
  if (!player) {
    error(`"player" must not be empty: ${player}`);
    return {};
  }

  return {
    ..._.pick(player, [
      'playerNumber',
      'playerName',
      'gameScore',
      'dealScore',
      'cards',
      ...addtionProperties,
    ]),
    cardsCount: ensureArray(player.cards).length,
  };
};

const postMessage = (
  player,
  eventName,
  data = {},
  playerInfos,
) => {
  const { id, isHuman, isWatcher } = player;
  let d = typeof data === 'function'
    ? data(isWatcher ? undefined : player)
    : data;

  if (playerInfos) {
    d = {
      ...d,
      players: playerInfos,
    };
  }
  const target = (isHuman || isWatcher) ? self : (new BroadcastChannel(`player-${id}`));
  const event = {
    eventName,
    data: d,
  };
  target.postMessage(event);
  eventHistory.push(event);
};

const broadcast = (eventName, data = {}, playerProperties) => {
  let playerInfos;

  if (playerProperties) {
    playerInfos = players.map((player) => getPlayerInfo(player, playerProperties));
  }

  players.forEach((player) => {
    postMessage(
      player,
      eventName,
      data,
      playerInfos,
    );
  });

  if (watchMode && watcherEvents.find((event) => event === eventName)) {
    postMessage(
      { isWatcher: true },
      eventName,
      data,
      playerInfos,
    );
  }
};

const mapRankToInteger = (rank) => {
  const r = String(rank).toUpperCase();

  return {
    T: 10,
    J: 11,
    Q: 12,
    K: 13,
    A: 99,
  }[r] || (Number(r) || 0);
};

const getShuffledCards = () => (
  _.chunk(
    // get random number from 0 ~ 51
    _.sampleSize(_.range(52), 52)
      // map to card string
      .map((i) => (`${numbers[Math.floor(i / maxPlayers)]}${suits[i % maxPlayers]}`)),
    // 13 cards for a player
    13,
  )
);

const updateRoundPlayers = (roundPlayer) => {
  if (!roundPlayer) {
    error(`"roundPlayer" must not be empty: ${roundPlayer}`);
    return;
  }
  const roundPlayerIndex = getPlayerIndex(players, roundPlayer.playerName);
  const roundPlayerObjs = _.range(maxPlayers).map(
    (i) => players[(i + roundPlayerIndex) % maxPlayers],
  );
  roundPlayerIndexs = roundPlayerObjs.map((player) => getPlayerIndex(players, player.playerName));
  roundPlayers = roundPlayerObjs.map((player) => player.playerName);
};

const handleCloseGame = () => {
  broadcast(e.CLOSE_GAME);
  self.close();
};

const handleJoin = ({
  id,
  playerName,
  playerNumber,
  isHuman,
}) => {
  if (isHuman) {
    watchMode = false;
  }

  if (players.find((player) => player.playerName === playerName)) {
    postMessage(
      { id },
      e.PLAYER_NAME_DUP,
    );
    error(`Player name: ${playerName} is duplicated`);
    return;
  }

  if (players.length >= maxPlayers) {
    error(`Exceeded the maximum amount of players: ${players.length}`);
    return;
  }

  players = [...players, {
    id,
    isHuman,
    playerNumber,
    playerName,
  }];

  broadcast(
    e.NEW_PEER,
    undefined,
    [],
  );

  if (players.length === 4) {
    players = _.sortBy(players, ['id']);
    handleStartGame();
  }
};

const handleStartGame = async () => {
  if (!(players.length >= maxPlayers && dealNumber === 0 && roundNumber === 0)) {
    warn(`Cannot start a new game: players=${players.length}, dealNumber=${dealNumber}, roundNumber=${roundNumber}`);
    return;
  }

  for (let i = 3; i > 0; i -= 1) {
    broadcast(
      e.GAME_PREPARE,
      { countDown: i },
    );
    // eslint-disable-next-line no-await-in-loop
    await delay(second);
  }
  await delay(second);

  newGame();
};

const newGame = () => {
  if (players.length < maxPlayers) {
    throw new Error(`Not enough players in server: ${players.length}`);
  }

  heartBroken = false;
  shootingTheMoon = false;
  dealNumber = 0;
  roundNumber = 0;
  passCount = 0;
  turnIndex = 0;

  players = players.map((player) => ({
    ...player,
    gameScore: 0,
    dealScore: 0,
    cards: [],
    scoreCards: [],
    pickedCards: [],
    receivedCards: [],
    receivedFrom: '',
    roundCard: '',
    doublePenalty: false,

    // Game result
    rank: 0,
    deals: [],
  }));

  broadcast(
    e.NEW_GAME,
    undefined,
    [],
  );

  nextDeal();
};

const nextDeal = async () => {
  // Update game history
  if (dealNumber > 0) {
    players = players.map(({ deals, ...player }) => ({
      ...player,
      deals: [
        ...deals,
        {
          dealNumber,
          score: player.dealScore,
        },
      ],
    }));
  }

  // Game end
  if (dealNumber >= maxDeals) {
    const orderedGameScores = _.orderBy(players, (player) => player.gameScore, 'desc')
      .map((player) => player.gameScore);

    broadcast(
      e.GAME_END,
      {
        players: players.map((player) => ({
          ..._.pick(player, [
            'playerNumber',
            'playerName',
            'gameScore',
            'deals',
          ]),
          rank: orderedGameScores.indexOf(player.gameScore) + 1,
        })),
      },
    );

    self.postMessage({
      eventName: e.HISTORY,
      data: JSON.stringify(eventHistory),
    });

    eventHistory = [];

    // Reset game state
    heartBroken = false;
    shootingTheMoon = false;
    dealNumber = 0;
    roundNumber = 0;
    passCount = 0;
    turnIndex = 0;

    return;
  }

  heartBroken = false;
  shootingTheMoon = false;
  dealNumber += 1;
  roundNumber = 0;
  passCount = 0;
  turnIndex = 0;

  // Reset state for a new deal
  const shuffledCards = getShuffledCards();
  players = players.map((player, i) => ({
    ...player,
    dealScore: 0,
    cards: shuffledCards[i],
    scoreCards: [],
    pickedCards: [],
    receivedCards: [],
    receivedFrom: '',
    roundCard: '',
    doublePenalty: false,
  }));

  broadcast(
    e.NEW_DEAL,
    (player) => ({
      dealNumber,
      self: player ? getPlayerInfo(player) : undefined,
    }),
    [],
  );

  if (dealNumber >= maxPlayers) {
    nextRound(true);
    return;
  }

  const passPlayers = _.map(
    _.sortBy(
      _.map(players, (player, index) => ({ player, index })),
      (value) => ((value.index + maxPlayers - passCardOffset[dealNumber - 1]) % 4),
    ),
    ({ player }) => player.playerName,
  );

  await delay(distributeTime);

  broadcast(
    e.PASS_CARDS,
    (player) => ({
      dealNumber,
      self: player ? getPlayerInfo(player) : undefined,
      receiver: player
        ? passPlayers[_.findIndex(players, ({ playerName }) => playerName === player.playerName)]
        : undefined,
    }),
    [],
  );
};

const handlePassMyCards = (payload) => {
  const { id, cards } = payload;
  const player = players.find((p) => p.id === id);

  if (_.intersection(player.cards, cards).length < 3) {
    error(`Not acceptable pass cards: cards=${JSON.stringify(cards)}`);
    return;
  }

  players = players.map((p) => {
    if (player.id !== p.id) {
      return p;
    }

    const pickedCards = [...cards];
    const restCards = _.difference(player.cards, pickedCards);

    return {
      ...p,
      cards: restCards,
      pickedCards,
    };
  });

  passCount += 1;
  if (passCount < players.length) {
    return;
  }

  if (dealNumber < maxDeals) {
    players = players.map((p, i) => {
      const sender = players[(i - passCardOffset[dealNumber - 1] + maxPlayers) % maxPlayers];
      const { cards: cs } = p;
      const { pickedCards } = sender;

      return {
        ...p,
        cards: [
          ...cs,
          ...pickedCards,
        ],
        pickedCards: p.pickedCards,
        receivedCards: pickedCards,
        receivedFrom: sender.playerName,
      };
    });

    broadcast(
      e.RECEIVE_OPPONENT_CARDS,
      (p1) => {
        const selfInfo = getPlayerInfo(p1, [
          'pickedCards',
          'receivedCards',
          'receivedFrom',
        ]);
        return {
          dealNumber,
          self: selfInfo,
          players: players.map((p2) => (
            player.playerNumber === p2.playerNumber
              ? selfInfo
              : getPlayerInfo(player)
          )),
          sender: p1.receivedFrom,
        };
      },
    );

    broadcast(
      e.PASS_CARDS_END,
      { dealNumber },
      [
        'pickedCards',
        'receivedCards',
        'receivedFrom',
      ],
    );
  }

  nextRound(true);
};

const nextRound = async (firstRound) => {
  if (firstRound) {
    // .-----.
    // | ♣ 2 |
    // .-----.
    const roundPlayer = players.find((player) => player.cards.indexOf(firstCard) > -1);
    updateRoundPlayers(roundPlayer);
  }

  if (roundNumber >= maxRounds) {
    players = players.map((player) => ({
      ...player,
      gameScore: _.sum([
        player.gameScore,
        player.dealScore,
      ]),
    }));

    broadcast(
      e.DEAL_END,
      {
        dealNumber,
      },
      ['scoreCards'],
    );

    await delay(newDealInterval);

    nextDeal();
    return;
  }

  roundNumber += 1;
  turnIndex = 0;
  players = players.map((player) => ({
    ...player,
    roundCard: '',
  }));

  await delay(newRoundInterval);

  broadcast(
    e.NEW_ROUND,
    {
      dealNumber,
      roundNumber,
      roundPlayers,
    },
    ['scoreCards'],
  );

  nextTurn();
};

const nextTurn = async () => {
  const firstTurnIndex = roundPlayerIndexs[0];
  if (turnIndex >= players.length) {
    turnIndex = 0;

    let scoreCards = [];
    let roundPlayer = players[firstTurnIndex];

    const [, suit0] = roundPlayer.roundCard.split('');
    let hasDoublePenaltyCard = false;

    roundPlayer = _.maxBy(players, (player) => {
      const { roundCard } = player;

      // all ♥ cards and ♠Q
      if (_.includes(penaltyCards, roundCard)) {
        scoreCards.push(roundCard);
      }

      // ♣10
      if (roundCard === doublePanaltyCard) {
        hasDoublePenaltyCard = true;
      }

      const [rank, suit] = roundCard.split('');
      return (suit === suit0) ? mapRankToInteger(rank) : 0;
    });

    if (hasDoublePenaltyCard) {
      roundPlayer.doublePenalty = true;
    }

    players = players.map((player) => {
      if (player.id === roundPlayer.id) {
        scoreCards = _.union(player.scoreCards, scoreCards);
        const dealScore = scoreCards.reduce((acc, scoreCard) => {
          if (scoreCard === pigCard) {
            return acc - 13;
          }
          if (scoreCard === doublePanaltyCard) {
            return acc;
          }
          return acc - 1;
        }, 0);
        if (dealScore === -26) {
          shootingTheMoon = true;
        }
        return {
          ...player,
          scoreCards,
          dealScore: dealScore * (player.doublePenalty ? 2 : 1),
        };
      }
      return player;
    });

    if (shootingTheMoon) {
      players = players.map((player) => {
        if (player.scoreCards.length >= 14) {
          return {
            ...player,
            dealScore: 0,
          };
        }
        return {
          ...player,
          dealScore: -26 * (player.doublePenalty ? 2 : 1),
        };
      });
    }

    broadcast(
      e.ROUND_END,
      {
        dealNumber,
        roundNumber,
        roundPlayers,
        roundPlayer: roundPlayer.playerName,
      },
      [
        'scoreCards',
        'roundCard',
      ],
    );

    updateRoundPlayers(roundPlayer);

    await delay(commandInterval);
    nextRound();
    return;
  }

  const roundPlayerIndex = roundPlayerIndexs[turnIndex];
  const candidateSuit = players[firstTurnIndex].roundCard.split('')[1];
  const player = players[roundPlayerIndex];
  let candidateCards = player.cards;

  if (candidateCards.indexOf(firstCard) > -1) {
    candidateCards = [firstCard];
  } else {
    if (!heartBroken) {
      candidateCards = candidateCards.filter((card) => {
        const suit = card[1];
        return suit !== heartSuit;
      });
    }
    if (candidateSuit) {
      candidateCards = candidateCards.filter((card) => {
        const suit = card[1];
        return !!candidateSuit && (suit === candidateSuit);
      });
    }
    if (candidateCards.length === 0) {
      candidateCards = player.cards;
    }
  }

  postMessage(
    player,
    e.YOUR_TURN,
    {
      dealNumber,
      roundNumber,
      self: {
        ...getPlayerInfo(player),
        candidateCards,
      },
      roundPlayers,
    },
    players.map((p) => getPlayerInfo(p, [
      'scoreCards',
      'roundCard',
    ])),
  );

  turnIndex += 1;
};

const handlePickCard = async (payload) => {
  const { id, turnCard } = payload;
  const player = players.find((p) => p.id === id);

  if (player.cards.indexOf(turnCard) < 0) {
    error(`Not acceptable turn card: turnCard=${turnCard}`);
    return;
  }

  if (turnCard[1] === heartSuit) {
    heartBroken = true;
  }

  players = players.map((p) => {
    let { cards, roundCard } = p;
    if (player.id === p.id) {
      cards = _.difference(player.cards, [turnCard]);
      roundCard = turnCard;
    }
    return {
      ...p,
      cards,
      roundCard,
    };
  });

  await delay(commandInterval);

  broadcast(
    e.TURN_END,
    {
      dealNumber,
      roundNumber,
      roundPlayers,
      turnPlayer: player.playerName,
      turnCard,
    },
    [
      'scoreCards',
      'roundCard',
    ],
  );

  nextTurn();
};

const eventListener = (event) => {
  try {
    const { eventName, data } = event.data;
    switch (eventName) {
      case e.CLOSE_GAME:
        handleCloseGame();
        break;
      case e.JOIN:
        handleJoin(data);
        break;
      case e.PASS_MY_CARDS:
        handlePassMyCards(data);
        break;
      case e.PICK_CARD:
        handlePickCard(data);
        break;
      default:
    }
  } catch (err) {
    error(err.message);
  }
};

boardChannel.addEventListener('message', eventListener);

self.postMessage(true);
