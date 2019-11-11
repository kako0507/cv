import _ from 'lodash';
import { southPlayerIndex } from '../../constants/hearts/game';
import Board from '../../worker/hearts/board.worker';
import Player from '../../worker/hearts/dummy-player.worker';

const postBoardMessage = (msg) => {
  const boardChannel = new BroadcastChannel('board');
  boardChannel.postMessage({
    ...msg,
    data: {
      ...msg.data,
      id: southPlayerIndex,
    },
  });
};

const startHeartsGame = ({ emitter, openMsg }) => (
  new Promise((resolve) => {
    const board = new Board();
    let sequenceNumber = 0;

    resolve({
      close: () => {
        board.terminate();
      },
      send: (msg) => {
        postBoardMessage(msg);
      },
    });

    board.addEventListener('message', (event) => {
      let msg = null;

      // web worker is ready
      if (event.data === true) {
        _.range(4).forEach((i) => {
          if (openMsg.data.isHuman && i === southPlayerIndex) {
            postBoardMessage(openMsg);
          } else {
            const player = new Player();
            player.postMessage(i);
          }
        });
        return;
      }

      try {
        msg = event.data;
        if (msg) {
          emitter({
            ...msg,
            sequenceNumber,
          });
        }
      } catch (error) {
        emitter({ error: _.get(error, 'message') });
      }
      sequenceNumber += 1;
    });
    board.addEventListener('error', () => {
      emitter({ error: 'Web Worker error' });
    });
  })
);

export default {
  startHeartsGame,
};
