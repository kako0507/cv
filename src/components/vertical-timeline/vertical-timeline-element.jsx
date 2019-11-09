import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './vertical-timeline.module.scss';

const VerticalTimelineElement = ({
  id,
  children,
  contentArrowStyle,
  contentStyle,
  icon,
  iconStyle,
  date,
  position,
  style,
  className,
}) => (
  <div
    id={id}
    className={classNames(
      className,
      styles.element,
      {
        [styles.left]: position === 'left',
        [styles.right]: position === 'right',
        [styles.noChildren]: children === '',
      },
    )}
    style={style}
  >
    <div>
      <span
        data-aos="zoom-in-up"
        className={styles.icon}
        style={iconStyle}
      >
        {icon}
      </span>
      <div
        data-aos="zoom-in-up"
        style={contentStyle}
        className={styles.content}
      >
        <div
          style={contentArrowStyle}
          className={styles.contentArrow}
        />
        {children}
        <span className={styles.date}>
          {date}
        </span>
      </div>
    </div>
  </div>
);

VerticalTimelineElement.propTypes = {
  id: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
  contentArrowStyle: PropTypes.shape({}),
  contentStyle: PropTypes.shape({}),
  icon: PropTypes.element,
  iconStyle: PropTypes.shape({}),
  style: PropTypes.shape({}),
  date: PropTypes.node,
  position: PropTypes.string,
  visibilitySensorProps: PropTypes.shape({}),
};

VerticalTimelineElement.defaultProps = {
  id: '',
  children: '',
  className: '',
  contentArrowStyle: null,
  contentStyle: null,
  icon: null,
  iconStyle: null,
  style: null,
  date: '',
  position: '',
  visibilitySensorProps: { partialVisibility: true, offset: { bottom: 40 } },
};

export default VerticalTimelineElement;
