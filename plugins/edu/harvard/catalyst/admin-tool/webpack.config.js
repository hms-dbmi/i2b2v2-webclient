const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require('copy-webpack-plugin');

const APP_DIR = path.resolve(__dirname, "./src");
const VENDOR_DIR = path.resolve(__dirname, "./node_modules");

const isEnvDevelopment = true; //webpackEnv === 'development';
const isEnvProduction = false;//webpackEnv === 'production';

module.exports = {
  output: {
    path: path.join(__dirname, "/dist"), // the bundle output path
    filename: "bundle.js", // the name of the bundle,
  },
  resolve: {
    modules: ['node_modules', APP_DIR, VENDOR_DIR],
    extensions: ['.js', '.jsx']
  },
 entry: "index",
  plugins: [

    // Generates an `index.html` file with the <script> injected.
    new HtmlWebpackPlugin(
        Object.assign(
            {},
            {
              inject: true,
              template: "src/index.html",
            },
            isEnvProduction
                ? {
                  minify: {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    keepClosingSlash: true,
                    minifyJS: true,
                    minifyCSS: true,
                    minifyURLs: true,
                  },
                }
                : undefined
        )
    ),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'public', 'assets'),
          to: path.join(__dirname, 'dist', 'assets'),
          noErrorOnMissing: true
        }
      ]
    }),
  ],
  devServer: {
    port: 3030, // you can change the port
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // .js and .jsx files
        exclude: /node_modules/, // excluding the node_modules folder
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.(sa|sc|c)ss$/, // styles files
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/, // to import images and fonts
        loader: "url-loader",
        options: { limit: false },
      },
    ],
  },

};






