import React, { forwardRef } from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faBriefcase } from '@fortawesome/free-solid-svg-icons';
import Title from '../title';
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from '../vertical-timeline';
import styles from './experiences.module.scss';

const Experiences = forwardRef((props, ref) => {
  const {
    allExperiencesJson: { career, education },
  } = useStaticQuery(
    graphql`
      {
        allExperiencesJson {
          career {
            title
            subtitle
            dateText
            contributions
          }
          education {
            title
            subtitle
            dateText
            dissertation {
              title
              description
            }
          }
        }
      }
    `,
  );
  return (
    <section
      id="experiences"
      ref={ref}
      className="section is-small"
    >
      <div className="container is-small">
        <Title>
          Experiences
        </Title>
        <VerticalTimeline>
          {career.map(({
            title,
            subtitle,
            dateText,
            contributions,
          }) => (
            <VerticalTimelineElement
              className={styles.verticalTimelineElementWork}
              date={dateText}
              icon={<FontAwesomeIcon icon={faBriefcase} />}
              key={title}
            >
              <div className="media">
                <div className="media-content">
                  <p className="is-marginless has-text-weight-bold">{title}</p>
                  <p className="subtitle is-5 is-marginless has-text-weight-bold">{subtitle}</p>
                </div>
              </div>
              <div className="content">
                <ul>
                  {contributions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </VerticalTimelineElement>
          ))}
          {education.map(({
            title,
            subtitle,
            dateText,
            dissertation,
          }) => (
            <VerticalTimelineElement
              className={styles.verticalTimelineElementEducation}
              date={dateText}
              icon={<FontAwesomeIcon icon={faGraduationCap} />}
              key={title}
            >
              <div className="media">
                <div className="media-content">
                  <p className="is-marginless has-text-weight-bold">{title}</p>
                  <p className="subtitle is-5 is-marginless has-text-weight-bold">{subtitle}</p>
                </div>
              </div>
              <div className="is-size-6 has-text-weight-bold">{dissertation.title}</div>
              <div className="is-size-6">{dissertation.description}</div>
            </VerticalTimelineElement>
          ))}
        </VerticalTimeline>
      </div>
    </section>
  );
});

export default Experiences;
