import React from 'react';
import PropTypes from 'prop-types';

const Link = ({
  href,
  className,
  innerClassName,
  icon,
  children,
}) => (
  <a
    href={href}
    className={className}
    target="_blank"
    rel="noopener noreferrer"
  >
    {icon && (
      <span className="icon is-medium">
        {icon}
      </span>
    )}
    <span className={innerClassName}>
      {children}
    </span>
  </a>
);

Link.propTypes = {
  href: PropTypes.string.isRequired,
  className: PropTypes.string,
  innerClassName: PropTypes.string,
  icon: PropTypes.node,
  children: PropTypes.node.isRequired,
};

Link.defaultProps = {
  className: undefined,
  innerClassName: undefined,
  icon: undefined,
};

export default Link;
