import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { StaticQuery, graphql } from 'gatsby';
import Img from 'gatsby-image';

const Image = ({ alt, filename }) => {
  const render = useCallback((data) => {
    const [image] = data.images.edges.filter((n) => (
      n.node.relativePath.indexOf(filename) > -1
    ));
    if (!image) {
      return null;
    }
    return (
      <Img
        alt={alt}
        fluid={image.node.childImageSharp.fluid}
      />
    );
  }, [alt, filename]);
  return (
    <StaticQuery
      query={graphql`
        query {
          images: allFile {
            edges {
              node {
                relativePath
                name
                childImageSharp {
                  fluid(maxWidth: 600) {
                    ...GatsbyImageSharpFluid
                  }
                }
              }
            }
          }
        }
      `}
      render={render}
    />
  );
};

Image.propTypes = {
  alt: PropTypes.string.isRequired,
  filename: PropTypes.string.isRequired,
};

export default Image;
