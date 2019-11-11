const webpack = require('webpack');

exports.onCreateWebpackConfig = ({
  stage,
  actions,
}) => {
  actions.setWebpackConfig({
    plugins: [
      new webpack.NormalModuleReplacementPlugin(/(.*)\.NODE_ENV(\.*)/, (resource) => {
        let mode;
        if (stage === 'develop' || stage === 'develop-html') {
          mode = 'development';
        } else {
          mode = 'production';
        }
        // eslint-disable-next-line no-param-reassign
        resource.request = resource.request.replace(/\.NODE_ENV/, `.${mode}`);
      }),
    ],
  });
};
