import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import scrollTo from 'gatsby-plugin-smoothscroll';
import useOnClickOutside from '../../../hooks/use-onclickoutside';
import styles from './navbar.module.scss';

const Navbar = ({ activeSection }) => {
  const [transparent, setTransparent] = useState(true);
  const [isMenuOpen, openMenu] = useState(false);
  const isNavbarTransparent = transparent && !isMenuOpen;
  const refNav = useRef(null);
  const refBurger = useRef(null);

  const handleClickTag = useCallback((event) => {
    const tag = event.target.getAttribute('href');
    scrollTo(tag);
    openMenu(false);
    event.preventDefault();
  }, []);

  const handleClickBurger = useCallback(() => {
    openMenu(!isMenuOpen);
  }, [isMenuOpen]);

  const closeMenu = useCallback(() => {
    openMenu(false);
  }, []);

  useOnClickOutside(refNav, closeMenu);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, clientHeight } = document.documentElement;
      const navHeight = refNav.current.offsetHeight;
      if (scrollTop >= (clientHeight - navHeight)) {
        setTransparent(false);
      } else {
        setTransparent(true);
      }
    };
    const handleResize = () => {
      const { display } = window.getComputedStyle(refBurger.current);
      if (display === 'none') {
        openMenu(false);
      }
    };
    document.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return (
    <nav
      ref={refNav}
      role="navigation"
      aria-label="main navigation"
      className={classNames(
        'navbar is-fixed-top',
        styles.navbar,
        {
          'is-transparent': isNavbarTransparent,
          [styles.hasBackgroundTransparent]: isNavbarTransparent,
        },
      )}
    >
      <div className="navbar-brand">
        <button
          ref={refBurger}
          type="button"
          className={classNames(
            'navbar-burger burger',
            styles.burger,
            {
              'has-text-white': isNavbarTransparent,
              'is-active': isMenuOpen,
            },
          )}
          aria-label="menu"
          aria-expanded="false"
          onClick={handleClickBurger}
          onKeyPress={handleClickBurger}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>

      <div
        className={classNames(
          'navbar-menu',
          { 'is-active': isMenuOpen },
        )}
      >
        <div className="navbar-end">
          <a
            href="#skills"
            className={classNames(
              'navbar-item',
              {
                'has-text-white': isNavbarTransparent,
                'is-active': activeSection === 1,
              },
            )}
            onClick={handleClickTag}
          >
            Skills
          </a>
          <a
            href="#experiences"
            className={classNames(
              'navbar-item',
              {
                'has-text-white': isNavbarTransparent,
                'is-active': activeSection === 2,
              },
            )}
            onClick={handleClickTag}
          >
            Experiences
          </a>
          <a
            href="#recent-works"
            className={classNames(
              'navbar-item',
              {
                'has-text-white': isNavbarTransparent,
                'is-active': activeSection === 3,
              },
            )}
            onClick={handleClickTag}
          >
            Recent Works
          </a>
          <a
            href="#contact"
            className={classNames(
              'navbar-item',
              {
                'has-text-white': isNavbarTransparent,
                'is-active': activeSection === 4,
              },
            )}
            onClick={handleClickTag}
          >
            Contact Me
          </a>
        </div>
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  activeSection: PropTypes.number,
};

Navbar.defaultProps = {
  activeSection: undefined,
};

export default Navbar;
