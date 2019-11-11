import PropTypes from 'prop-types';
import React from 'react';
import Animated from '../animated';
import styles from './count-down.module.scss';

const CountDown = ({
  countDownFontSize,
  value,
}) => (
  <Animated
    className={styles.countDown}
    style={{
      width: countDownFontSize,
      height: countDownFontSize,
      marginTop: -(countDownFontSize / 2),
      marginLeft: -(countDownFontSize / 2),
      fontSize: countDownFontSize,
      lineHeight: `${countDownFontSize}px`,
    }}
    key={value}
  >
    {value}
  </Animated>
);

CountDown.propTypes = {
  countDownFontSize: PropTypes.number,
  value: PropTypes.number,
};

CountDown.defaultProps = {
  countDownFontSize: undefined,
  value: undefined,
};

export default CountDown;
