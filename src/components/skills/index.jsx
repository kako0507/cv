import React, { forwardRef } from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import Title from '../title';

const Skills = forwardRef((props, ref) => {
  const {
    allSkillsJson: { skills },
  } = useStaticQuery(
    graphql`
      {
        allSkillsJson {
          skills {
            type
            list
          }
        }
      }
    `,
  );
  return (
    <section
      id="skills"
      ref={ref}
      className="section is-small"
    >
      <div className="container is-small">
        <Title>
          Skills
        </Title>
        <div className="columns">
          {skills.map(({ list, type }) => (
            <div
              className="column"
              key={type}
            >
              <div className="card" data-aos="zoom-in-up">
                <div className="card-content">
                  <div className="content">
                    <div className="title is-5">{type}</div>
                    <div className="tags">
                      {list.map((item) => (
                        <span
                          className="tag is-medium is-light"
                          key={item}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default Skills;
