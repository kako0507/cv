module.exports = {
  pathPrefix: '/cv',
  siteMetadata: {
    title: 'Kuo Chih Hsiang',
    description: 'Senior Front-end Engineer',
    author: '@kako0507',
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
    'gatsby-transformer-json',
    'gatsby-plugin-smoothscroll',
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'Kuo Chih Hsiang',
        short_name: 'Kuo Chih Hsiang',
        start_url: '.',
        display: 'standalone',
        icon: 'src/images/gatsby-icon.png', // This path is relative to the root of the site.
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: './src/',
      },
    },
    {
      resolve: 'gatsby-plugin-sass',
      options: {
        cssLoaderOptions: {
          localsConvention: 'camelCase',
        },
      },
    },
    {
      resolve: 'gatsby-plugin-react-svg',
      options: {
        rule: {
          include: /\.inline\.svg$/,
        },
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // 'gatsby-plugin-offline',
  ],
};
