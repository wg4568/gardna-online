const path = require("path");
const config = require("./config.json");

module.exports = {
    entry: "./src/client/client.ts",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/,
                options: {
                    configFile: "tsconfig.webpack.json"
                }
            }
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    output: {
        library: "GardnaOnline",
        filename: "bundle.js",
        path: path.resolve(__dirname, "static/js")
    },
    optimization: {
        minimize: !config.debug
    }
};
