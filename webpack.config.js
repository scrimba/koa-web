var path = require('path');

module.exports = {
  entry: './test',

  mode: 'development',

  output: {
    path: path.resolve(__dirname, 'test'),
    filename: 'bundle.js'
  },

  node: {
    fs: "empty"
  }
};
