import React, { forwardRef } from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDoubleDown } from '@fortawesome/free-solid-svg-icons';
import { faGithubAlt, faLinkedinIn } from '@fortawesome/fontawesome-free-brands';
import scrollTo from 'gatsby-plugin-smoothscroll';
import Link from '../link';
import CakeResume from './cake-resume.inline.svg';
import styles from './hero.module.scss';

const scrollToContent = () => {
  scrollTo('#skills');
};

const Hero = forwardRef((props, ref) => (
  <section
    ref={ref}
    className={classNames(
      'hero is-bold is-fullheight',
      styles.gradientBg,
    )}
  >
    <div className="hero-body">
      <div className="container">
        <h1 className="title is-size-1 has-text-white">
          Kuo Chih Hsiang
        </h1>
        <h2 className="subtitle has-text-white">
          Senior Front End Developer
        </h2>
        <Link
          href="https://github.com/kako0507/"
          className="button is-small is-dark"
          icon={<FontAwesomeIcon icon={faGithubAlt} />}
        >
          Github
        </Link>
        {' '}
        <Link
          href="https://www.linkedin.com/in/kako0507/"
          className="button is-small is-link"
          icon={<FontAwesomeIcon icon={faLinkedinIn} />}
        >
          LinkedIn
        </Link>
        {' '}
        <Link
          href="https://www.cakeresume.com/me/kuo-chih-hsiang-79ad17"
          className="button is-small"
          innerClassName="has-text-success has-text-weight-bold"
          icon={<CakeResume />}
        >
          CakeResume
        </Link>
      </div>
    </div>
    <div
      className={classNames(
        styles.angleDoubleDown,
        'icon has-text-grey-light',
      )}
    >
      <span
        role="button"
        tabIndex="0"
        onClick={scrollToContent}
        onKeyPress={scrollToContent}
      >
        <FontAwesomeIcon
          icon={faAngleDoubleDown}
          size="3x"
        />
      </span>
    </div>
  </section>
));

export default Hero;
