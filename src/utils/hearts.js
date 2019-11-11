import { southPlayerIndex } from '../constants/hearts/game';

export const nop = () => {};

export const findParentsClass = (el, className) => {
  if (!className) {
    return null;
  }
  let elmnt = el;
  if (elmnt.className) {
    if (elmnt.className.indexOf(className) > -1) {
      return elmnt;
    }
  }
  while (elmnt.parentNode) {
    elmnt = elmnt.parentNode;
    if (elmnt.className) {
      if (elmnt.className.indexOf(className) > -1) {
        return elmnt;
      }
    }
  }
  return null;
};

export const getUserInfo = () => ({
  playerName: 'Guest',
  playerNumber: southPlayerIndex + 1,
});
