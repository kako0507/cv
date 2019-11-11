import _ from 'lodash';

export const suits = ['D', 'C', 'H', 'S'];
export const numbers = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

export const suitNames = {
  D: 'diamond',
  C: 'club',
  H: 'heart',
  S: 'spade',
};

export const suitSymbols = {
  D: '♦',
  C: '♣',
  H: '♥',
  S: '♠',
};

export const numberDisplayNames = _.mapValues(
  _.mapKeys(
    numbers,
    (v) => v,
  ),
  (v) => (v === 'T' ? '10' : v),
);

export const firstCard = '2C';
export const doublePanaltyCard = 'TC';
export const pigCard = 'QS';
export const heartSuit = 'H';
export const penaltyCards = numbers
  .map((num) => `${num}${heartSuit}`)
  .concat([pigCard, doublePanaltyCard]);
