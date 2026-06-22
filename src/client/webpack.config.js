const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './public/index.html' })
  ],
  // dev server: runs on 3001, forwards /api calls to Express on 3000
  devServer: {
    port: 3001,
    historyApiFallback: true, // so React Router handles all URLs, not the dev server
    proxy: [{ context: ['/api'], target: 'http://localhost:3000' }]
  },
  resolve: { extensions: ['.js', '.jsx'] }
}
