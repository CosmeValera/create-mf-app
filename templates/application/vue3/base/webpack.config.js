const HtmlWebPackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const { VueLoaderPlugin } = require("vue-loader");
const path = require('path');
const Dotenv = require('dotenv-webpack');

const printCompilationMessage = (status, port) => {
  let messageColor, messageType, browserMessage

  switch (status) {
    case 'success':
      messageColor = '\x1b[32m'
      messageType = 'Compiled successfully!'
      browserMessage = 'You can now view'
      break
    case 'failure':
      messageColor = '\x1b[31m'
      messageType = 'Compilation Failed!'
      browserMessage = 'You can\'t now view'
      break
    case 'compiling':
      messageColor = '\x1b[94m'
      messageType = 'Compiling...'
      browserMessage = 'Compiling the'
      break
  }

  console.log(`\n\n
${messageColor}${messageType}\x1b[0m\n
${browserMessage} \x1b[1mRemote\x1b[0m in the browser.
${messageColor}${messageType}\x1b[0m\n
\x1b[1mLocal\x1b[0m:  http://localhost:\x1b[1m${port}\x1b[0m
\x1b[1mLocal\x1b[0m:  http://localhost:\x1b[1m${port}\x1b[0m\n\n
  `)
}

module.exports = (_, argv) => ({
  output: {
    publicPath: "http://localhost:{{PORT}}/",
  },

  resolve: {
    extensions: [".tsx", ".ts", ".vue", ".jsx", ".js", ".json"],
  },

  devServer: {
    port: {{PORT}},
    historyApiFallback: true,
    watchFiles: [path.resolve(__dirname, 'src')],
    onListening: function (devServer) {
      const port = devServer.server.address().port

      printCompilationMessage('compiling', port)

      devServer.compiler.hooks.done.tap('OutputMessagePlugin', (stats) => {
        setImmediate(() => {
          if (stats.hasErrors()) {
            printCompilationMessage('failure', port)
          } else {
            printCompilationMessage('success', port)
          }
        })
      })
    }
  },

  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      {
        test: /\.tsx?$/,
        use: [
          "babel-loader",
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              appendTsSuffixTo: ["\\.vue$"],
              happyPackMode: true,
            },
          },
        ],
      },
      {
        test: /\.(css|s[ac]ss)$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ],
  },

  plugins: [
    new VueLoaderPlugin(),
    new ModuleFederationPlugin({
      name: "{{SAFE_NAME}}",
      filename: "remoteEntry.js",
      remotes: {},
      exposes: {},
      shared: require("./package.json").dependencies,
    }),
    new HtmlWebPackPlugin({
      template: "./src/index.html",
    }),
    new Dotenv()
  ],
});
