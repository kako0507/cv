import React from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithubAlt } from '@fortawesome/fontawesome-free-brands';

import styles from './footer.module.scss';

const Footer = () => (
  <footer
    className={classNames(
      'footer',
      styles.footer,
    )}
  >
    <div className="content has-text-centered">
      <p>
        <br />
        <span>This website was built using</span>
        <a
          href="https://www.gatsbyjs.org/"
          className="button is-text"
          target="_blank"
          rel="noopener noreferrer"
        >
          Gatsby
        </a>
        +
        <a
          href="https://bulma.io/"
          className="button is-text"
          target="_blank"
          rel="noopener noreferrer"
        >
          Bulma
        </a>
        <br />
        <span>and deployed by</span>
        <a
          href="https://help.github.com/en/actions"
          className="button is-text"
          target="_blank"
          rel="noopener noreferrer"
        >
          Github Actions
        </a>
        <br />
        <br />
        <a
          href="https://github.com/kako0507/cv"
          className="button"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="icon is-medium">
            <FontAwesomeIcon icon={faGithubAlt} />
          </span>
          <span>Source Code</span>
        </a>
      </p>
    </div>
  </footer>
);

export default Footer;
