import React from 'react';
import PropTypes from 'prop-types';
import './layout.scss';

const Layout = ({ children }) => (
  <div className="has-background-grey-lighter">
    {children}
  </div>
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
