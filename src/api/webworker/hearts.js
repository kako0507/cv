import _ from 'lodash';
import uuidv4 from 'uuid/v4';
import BroadcastChannel from 'broadcast-channel';
import { southPlayerIndex } from '../../constants/hearts/game';
import Board from '../../worker/hearts/board.worker';
import Player from '../../worker/hearts/dummy-player.worker';


const uuid = uuidv4();

const postBoardMessage = (msg) => {
  const boardChannel = new BroadcastChannel(`board-${uuid}`);
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

    board.postMessage(uuid);

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
            player.postMessage({
              id: i,
              uuid,
            });
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
