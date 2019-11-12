/* eslint-disable no-restricted-globals */
import _ from 'lodash';
import BroadcastChannel from 'broadcast-channel';
import faker from 'faker/locale/en_US';
import e from '../../constants/hearts/event-types';

self.addEventListener('message', ({ data: { id, uuid } }) => {
  const boardChannel = new BroadcastChannel(`board-${uuid}`);
  const playerChannel = new BroadcastChannel(`player-${id}-${uuid}`);

  const passMyCards = (data) => {
    boardChannel.postMessage({
      eventName: e.PASS_MY_CARDS,
      data: {
        id,
        cards: _.shuffle(data.self.cards).slice(0, 3),
      },
    });
  };

  const pickCard = (data) => {
    boardChannel.postMessage({
      eventName: e.PICK_CARD,
      data: {
        id,
        turnCard: _.shuffle(data.self.candidateCards)[0],
      },
    });
  };

  const join = () => {
    boardChannel.postMessage({
      eventName: e.JOIN,
      data: {
        id,
        playerNumber: id + 1,
        playerName: faker.name.findName(),
        isHuman: false,
      },
    });
  };

  playerChannel.onmessage = ({ eventName, data }) => {
    try {
      switch (eventName) {
        case e.PLAYER_NAME_DUP:
          join();
          break;
        case e.PASS_CARDS:
          passMyCards(data);
          break;
        case e.YOUR_TURN:
          pickCard(data);
          break;
        case e.CLOSE_GAME:
          self.close();
          break;
        default:
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  join();
});
