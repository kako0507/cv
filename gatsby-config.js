module.exports = {
  pathPrefix: '/cv',
  siteMetadata: {
    title: 'Kuo Chih Hsiang',
    description: 'Senior Front-end Engineer',
    author: '@kako0507',
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: `${__dirname}/src/images`,
      },
    },
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'Kuo Chih Hsiang',
        short_name: 'Kuo Chih Hsiang',
        start_url: '.',
        display: 'standalone',
        icon: `src/images/gatsby-icon.png`, // This path is relative to the root of the site.
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // 'gatsby-plugin-offline',
  ],
}
