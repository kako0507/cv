import _ from 'lodash';
import e from './event-types';

export const maxPlayers = 4;
export const maxDeals = 4;
export const maxRounds = 13;

export const second = 1000;
export const distributeTime = 5000;
export const commandInterval = 500;
export const newRoundInterval = 2000;
export const newDealInterval = 2000;

const cardIndexs = _.range(52);
const cardList = cardIndexs.map((id) => {
  const playerIndex = id % 4;
  const handCardIndex = Math.floor(id / 4);
  return {
    id,
    playerIndex,
    handCardIndex,
    pos: {
      x: (Math.floor(id / 13) - 2) * 5,
      y: 0,
      rotateY: 180,
      zIndex: 51 - id,
    },
  };
});
const handCardGroups = _.groupBy(cardIndexs, (id) => id % 4);

export const modes = _.mapKeys([
  'WATCH',
  'HUMAN',
  'REPLAY',
]);

export const playerPositions = [
  'N',
  'E',
  'S',
  'W',
];

export const southPlayerIndex = playerPositions.indexOf('S');

export const gameImmediateStatus = _.mapKeys([
  'STOPPED',
  'PREPARING',
  'ONGOING',
  'PAUSED',
], (value) => value);

export const gameInitData = {
  phase: '',
  players: [],
  gameHistory: [],
  showScoreBoard: false,
  gameStatus: gameImmediateStatus.PREPARING,
  dealNumber: undefined,
};

export const dealInitData = {
  cardList,
  scoreCards: [],
  handCardGroups,
  playedCardGroups: {},
  dealedCardsCount: 0,
  selectedCards: [],
  isGetCardListDone: false,
  turnPlayer: -1,
  prevTurnPlayer: -1,
  prevRoundInfo: {},
  passCardReceiver: undefined,
  roundPlayers: undefined,
};

export const gameLayout = {
  rowMargin: 10,
  borderRadius: 8,

  // card
  cardSep: 42,
  cardWidth: 140,
  cardHeight: 180,
  suitSize: 25,

  // playerInfo
  playerInfoWidth: 660,
  playerInfoFontSize: 32,
  playerInfoMargin: 6,
  scoreWidth: 75,
  scoreHeight: 45,

  // count down
  countDownFontSize: 360,

  dealNumberFontSize: 36,
};

export const maxCardSelection = {
  [e.PASS_CARDS]: 3,
  [e.YOUR_TURN]: 1,
};

export const passCardOffset = [
  1,
  3,
  2,
];

export const hideCardsPhases = [
  e.NEW_PEER,
  e.GAME_END,
];

export const preparationPhases = [
  ...hideCardsPhases,
  e.GAME_PREPARE,
  e.NEW_GAME,
  e.DISTRIBUTE_CARDS,
  e.DEAL_END,
];

export const watcherEvents = [
  e.GAME_PREPARE,
  e.NEW_GAME,
  e.NEW_DEAL,
  e.PASS_CARDS_END,
  e.NEW_ROUND,
  e.TURN_END,
  e.ROUND_END,
  e.DEAL_END,
  e.GAME_END,
];

export const ignoreUndoPhases = [
  e.NEW_PEER,
  e.GAME_PREPARE,
  e.NEW_ROUND,
];

export const slowMotionPhases = [
  e.PASS_CARDS_END,
];

export const gameEndPhases = [
  e.GAME_END,
  e.HISTORY,
];

export const redoPhaseStep = {
  [e.NEW_ROUND]: 2,
};
