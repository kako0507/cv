import _ from 'lodash';

const createRequestTypes = (base) => (
  ['', 'SUCCESS', 'FAILURE']
    .map((type) => (type ? `${base}_${type}` : base))
);

export default _.mapKeys([
  ...createRequestTypes('HEARTS_INIT'),

  // send web worker events
  ...createRequestTypes('HEARTS_JOIN'),
  ...createRequestTypes('HEARTS_KEY_DOWN'),
  ...createRequestTypes('HEARTS_CLICK_CARD'),
  ...createRequestTypes('HEARTS_PASS_CARDS'),
  ...createRequestTypes('HEARTS_PICK_CARD'),
  ...createRequestTypes('HEARTS_CLOSE_GAME'),

  ...createRequestTypes('HEARTS_PAUSE_GAME'),
  ...createRequestTypes('HEARTS_RESUME_GAME'),
  ...createRequestTypes('HEARTS_UNDO_GAME'),
  ...createRequestTypes('HEARTS_REDO_GAME'),

  // receive web worker events
  ...createRequestTypes('HEARTS_PARSE_EVENT'),

  'HEARTS_UNDO_GAME_MEM',
  'HEARTS_RESET_HISTORY',

  'HEARTS_SET_LAYOUT_RATIO',

  'HEARTS_REMOVE_COUNT_DOWN',

  'HEARTS_TOGGLE_SCORES',

  'HEARTS_DISTRIBUTE_CARDS',
  'HEARTS_SORT_CARDS',
  'HEARTS_HOVER_CARD',
  'HEARTS_HIGHLIGHT_CARD',
  'HEARTS_SELECT_CARDS',

  'HEARTS_SET_ROUND_TRICK_POS',
  'HEARTS_SET_COLLECTED_CARDS_POS',
  'HEARTS_SET_ALL_CARDS_POS',

  'HEARTS_ROTATE_PLAYERS',
], (v) => v);
