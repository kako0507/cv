import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './title.module.scss';

const Title = ({ className, children }) => (
  <h1
    className={classNames(
      'title is-2 has-text-grey-dark',
      className,
    )}
  >
    <span className={styles.content}>{children}</span>
  </h1>
);

Title.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

Title.defaultProps = {
  className: '',
};

export default Title;
