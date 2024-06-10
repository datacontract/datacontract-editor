import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin'
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import HtmlWebpackPlugin from 'html-webpack-plugin';


export default {
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.ttf$/,
                type: 'asset'
            },
            {
                test: /parser.worker\.js$/,
                use: { loader: "worker-loader" },
            },
        ]
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 9000,
        client: {
            overlay: false,
        },
    },
    plugins: [
        new MonacoWebpackPlugin({
            languages: ['yaml'],
            customLanguages: [
                {
                    label: 'yaml',
                    entry: 'monaco-yaml',
                    worker: {
                        id: 'monaco-yaml/yamlWorker',
                        entry: 'monaco-yaml/yaml.worker'
                    }
                }
            ]
        }),
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        })
    ]
}
