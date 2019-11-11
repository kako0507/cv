import _ from 'lodash';

export default _.mapKeys([
  'JOIN',
  'PLAYER_NAME_DUP',
  'NEW_PEER',
  'GAME_PREPARE',
  'NEW_GAME',
  'NEW_DEAL',
  'DISTRIBUTE_CARDS',
  'PASS_CARDS',
  'RECEIVE_OPPONENT_CARDS',
  'PASS_MY_CARDS',
  'PASS_CARDS_END',
  'NEW_ROUND',
  'YOUR_TURN',
  'PICK_CARD',
  'TURN_END',
  'ROUND_END',
  'DEAL_END',
  'GAME_END',
  'HISTORY',
  'CLOSE_GAME',
], (v) => v);
