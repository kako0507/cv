import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './vertical-timeline.module.scss';

const VerticalTimeline = ({
  children,
  className,
  layout,
}) => (
  <div
    className={classNames(
      className,
      styles.container,
      {
        [styles.twoColumns]: layout === '2-columns',
      },
    )}
  >
    {children}
  </div>
);

VerticalTimeline.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  className: PropTypes.string,
  layout: PropTypes.oneOf(['1-column', '2-columns']),
};

VerticalTimeline.defaultProps = {
  className: '',
  layout: '2-columns',
};

export default VerticalTimeline;
