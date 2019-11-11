import React, { forwardRef } from 'react';
import classNames from 'classnames';
import { Link } from 'gatsby';
import HyperLink from '../link';
import Title from '../title';
import Image from '../image';
import styles from './recent-works.module.scss';

const RecentWorks = forwardRef((props, ref) => (
  <section
    id="recent-works"
    ref={ref}
    className="section is-small"
  >
    <div className="container is-small">
      <Title>
        Recent Works
      </Title>
      <div className="columns">
        <div
          className={classNames(
            'column',
            styles.card,
          )}
        >
          <Link to="/hearts/">
            <div
              className="card"
              data-aos="zoom-in-up"
            >
              <div className="card-image">
                <figure className="image">
                  <Image alt="Trend Hearts" filename="trend-hears.png" />
                </figure>
              </div>
              <div className="card-content">
                <div className="content">
                  <div className="title is-5">Hearts Game</div>
                  <div className="subtitle is-6">
                    A Hearts game made by CSS transition.
                  </div>
                  <div className="tags">
                    <span
                      className="tag is-medium is-light"
                    >
                      RWD
                    </span>
                    <span
                      className="tag is-medium is-light"
                    >
                      React
                    </span>
                    <span
                      className="tag is-medium is-light"
                    >
                      Hooks
                    </span>
                    <span
                      className="tag is-medium is-light"
                    >
                      Redux-Saga
                    </span>
                    <span
                      className="tag is-medium is-light"
                    >
                      Web Worker
                    </span>
                    <span
                      className="tag is-medium is-light"
                    >
                      CSS Animation
                    </span>
                    <ul>
                      <li>Use Redux-Saga to easily handle side effects like websocket.</li>
                      <li>Three modes:</li>
                      <ul>
                        <li>Play mode: user can using this app to play with other client.</li>
                        <li>Watch mode: user can watch current playing game.</li>
                        <li>Replay mode: user can replay game history by JSON log.</li>
                      </ul>
                      <li>
                        Because of immutable data structure, it allow players to
                        undo/redo game history whenever you want!
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
        <div
          className={classNames(
            'column',
            styles.card,
          )}
        >
          <HyperLink href="https://kako0507.github.io/react-sticky-video/">
            <div className="card" data-aos="zoom-in-up">
              <div className="card-image">
                <div className="hero is-medium is-primary is-bold">
                  <div className="hero-body">
                    <div className="container">
                      <h1 className="title is-size-1">React Sticky Video</h1>
                      <h2 className="subtitle">
                        A component for creating sticky and floating video easily.
                      </h2>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-content">
                <div className="content">
                  <div className="title is-5">React Sticky Video</div>
                  <div className="subtitle is-6">
                    A component for creating sticky and floating video easily.
                  </div>
                  <div className="tags">
                    <span
                      className="tag is-medium is-light"
                    >
                      React
                    </span>
                    <span
                      className="tag is-medium is-light"
                    >
                      Hooks
                    </span>
                    <span
                      className="tag is-medium is-light"
                    >
                      CSS Animation
                    </span>
                  </div>
                  <ul>
                    <li>Use Redux-like global state</li>
                    <li>Currently support: File source, Youtube, Dailymotion</li>
                    <li>Support WebVTT Captions for All video sources</li>
                  </ul>
                </div>
              </div>
            </div>
          </HyperLink>
        </div>
      </div>
    </div>
  </section>
));

export default RecentWorks;
