import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Animated = ({
  className,
  style,
  children,
  enter,
  leave,
  isVisible,
}) => {
  const [animation, setAnimation] = useState();
  useEffect(() => {
    if (isVisible) {
      setAnimation(enter);
    } else if (animation) {
      setAnimation(leave);
    }
  }, [animation, enter, leave, isVisible]);
  return (
    <div
      className={classNames(
        'animated',
        animation,
        className,
      )}
      style={{
        ...style,
        opacity: animation ? undefined : 0,
        pointerEvents: isVisible ? undefined : 'none',
      }}
    >
      {children}
    </div>
  );
};

Animated.propTypes = {
  className: PropTypes.string,
  style: PropTypes.objectOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ])),
  children: PropTypes.node,
  enter: PropTypes.string,
  leave: PropTypes.string,
  isVisible: PropTypes.bool,
};

Animated.defaultProps = {
  className: undefined,
  style: undefined,
  children: undefined,
  enter: 'fadeIn',
  leave: 'fadeOut',
  isVisible: true,
};


export default Animated;
