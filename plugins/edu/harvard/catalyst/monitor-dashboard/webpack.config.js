const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require('copy-webpack-plugin');

const APP_DIR = path.resolve(__dirname, "./src");
const VENDOR_DIR = path.resolve(__dirname, "./node_modules");

module.exports = {
    entry: './src/index.js', // Entry point of your React app
    output: {
        path: path.resolve(__dirname, 'dist'), // Output directory
        filename: 'bundle.js', // Name of the bundled file
    },
    resolve: {
        modules: ['node_modules', APP_DIR, VENDOR_DIR],
        extensions: ['.js', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/, // Process .js and .jsx files
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                    },
                },
            },
            {
                test: /\.(sa|sc|c)ss$/, // styles files
                use: ["style-loader", "css-loader", "sass-loader"],
            }
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html', // Path to your HTML template
        }),
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
        static: path.resolve(__dirname, 'dist'), // Serve static files from 'dist'
        port: 3000, // Port for the development server
        open: true, // Open browser automatically
    },
};