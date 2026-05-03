const path = require('path');

module.exports = {
  entry: './src/app.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src/')
    }
  },
  devServer: {
    static: {
      directory: path.join(__dirname, './'),
      publicPath: '/'
    },
    compress: true,
    port: 8080,
    hot: true,
    open: true
  },
  mode: 'development'
};