import _ from 'lodash';
import { useEffect } from 'react';

const useOnClickOutside = (ref, handler, ignore) => {
  useEffect(
    () => {
      const listener = (event) => {
        const ignoreElement = ignore && document.querySelector(ignore);
        if (_.some([
          !ref.current,
          ref.current.contains(event.target),
          ignoreElement && ignoreElement.contains(event.target),
        ])) {
          return;
        }
        handler(event);
      };

      document.addEventListener('click', listener);
      return () => {
        document.removeEventListener('click', listener);
      };
    },
    [ref, handler, ignore],
  );
};

export default useOnClickOutside;
