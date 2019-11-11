import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './animated-popover.module.scss';
import Animated from '../animated';

const AnimatedPopover = ({
  isVisible,
  bottom,
  children,
}) => (
  <Animated
    className={classNames(
      styles.container,
      {
        [styles.center]: bottom === 0,
      },
    )}
    style={{
      marginBottom: bottom,
    }}
    isVisible={isVisible}
    enter="fadeInUp"
    leave="fadeOutDown"
  >
    {children}
  </Animated>
);

AnimatedPopover.propTypes = {
  children: PropTypes.node.isRequired,
  bottom: PropTypes.number,
  isVisible: PropTypes.bool,
};

AnimatedPopover.defaultProps = {
  bottom: 0,
  isVisible: true,
};

export default AnimatedPopover;
