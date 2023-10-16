import CopyWebpackPlugin from 'copy-webpack-plugin'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import path from 'path'
import webpack from 'webpack'
import { Configuration as DevServerConfiguration } from 'webpack-dev-server'

type WebpackConfig = webpack.Configuration & { devServer?: DevServerConfiguration }


export default (_: any, options: any): WebpackConfig => {
    const host = process.env.HOST ?? '0.0.0.0'
    const port = parseInt(process.env.PORT ?? '3000', 10)
    const showErrors = process.env.ERRORS

    const isProduction = options.mode === 'production'
    const isDevelopment = options.mode === 'development'

    const config: WebpackConfig = {}

    /*
     * -------------------------------------------------------------
     * Entry points
     * -------------------------------------------------------------
     */

    config.entry = {
        index: path.resolve(__dirname, 'src/app/index'),
    }

    /*
     * -------------------------------------------------------------
     * Output
     * -------------------------------------------------------------
     */

    config.output = {
        assetModuleFilename: 'assets/[hash][ext]',
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/[name]-[contenthash:6].js',
        publicPath: '/',
        clean: true,
    }

    /*
     * -------------------------------------------------------------
     * Optimization
     * -------------------------------------------------------------
     */

    config.optimization = isDevelopment ? {
        splitChunks: {
            cacheGroups: {
                default: false,
                vendors: false,
            },
        },
    } : {
        splitChunks: {
            chunks: (chunk) => !/^(polyfills|pages|modules)$/.test(chunk.name as string),
            cacheGroups: {
                vendor: {
                    chunks: 'all',
                    name: 'vendors',
                    test: /(?<!node_modules.*)[\\/]node_modules[\\/]/,
                    priority: 40,
                    enforce: true,
                },
                common: {
                    name: 'commons',
                    test: /(common|layout|hooks|misc)/,
                    minChunks: 1,
                    priority: 30,
                    reuseExistingChunk: true,
                },
                default: false,
                vendors: false,
            },
            maxInitialRequests: 10,
            minSize: 30000,
        },
    }

    /*
     * -------------------------------------------------------------
     * Plugins
     * -------------------------------------------------------------
     */

    config.plugins = []

    if (isDevelopment && showErrors) {
        config.plugins.push(new ForkTsCheckerWebpackPlugin())
    }

    config.plugins.push(
        new HtmlWebpackPlugin({
            filename: path.resolve(__dirname, 'dist/index.html'),
            template: 'src/app/index.html',
            inject: false,
            chunks: ['index']
        }),
    )

    if (isProduction) {
        config.plugins.push(
            new MiniCssExtractPlugin({
                filename: 'css/[name]-[contenthash:6].css',
                ignoreOrder: true,
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        context: 'public',
                        from: '**/*',
                    },
                    {
                        context: 'src',
                        from: 'charting-library',
                        to: 'charting-library',
                    },
                ],
            }),
        )
    }

    /*
     * -------------------------------------------------------------
     * Module
     * -------------------------------------------------------------
     */

    config.module = {
        rules: [
            {
                test: /\.(ts|js)x?$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
            {
                exclude: /\.module.(s(a|c)ss)$/,
                test: /\.s[ac]ss$/i,
                use: [
                    isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                    'css-loader',
                    'sass-loader',
                ],
            },
            {
                test: /charting\-library.css$/,
                use: [
                    'file-loader',
                ],
            },
            {
                test: /\.module\.s(a|c)ss$/,
                use: [
                    isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                localIdentName: isProduction
                                    ? '[hash:base64:15]'
                                    : '[path][name]__[local]--[hash:base64:5]',
                            },
                        },
                    },
                    'sass-loader',
                ],
            },
            {
                test: /\.(png|jpe?g|gif|webp|woff2?)$/,
                type: 'asset',
            },
            {
              test: /\.svg$/i,
              issuer: /\.[jt]sx?$/,
              resourceQuery: { not: [/url/] },
              use: ['@svgr/webpack'],
            },
            {
                test: /\.worker\.ts$/,
                use: 'worker-loader',
            },
            {
                test: /\.wasm$/,
                type: 'javascript/auto',
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[hash].[ext]',
                        outputPath: 'wasm/',
                        esModule: false
                    }
                }]
            }
        ],
    }

    /*
     * -------------------------------------------------------------
     * Resolve
     * -------------------------------------------------------------
     */

    config.resolve = {
        alias: {
            '@': path.resolve(__dirname, 'src')
        },

        extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts', '.scss', '.css'],

        fallback: {
            buffer: require.resolve('buffer'),
        },

        modules: [
            path.resolve(__dirname, 'src'),
            'node_modules',
        ],
    }

    /*
     * -------------------------------------------------------------
     * Devtool
     * -------------------------------------------------------------
     */

    if (isDevelopment) {
        config.devtool = 'inline-source-map'
    }

    /*
     * -------------------------------------------------------------
     * Dev Server
     * -------------------------------------------------------------
     */

    if (isDevelopment) {
        config.devServer = {
            host,
            port,
            historyApiFallback: true,
            liveReload: false,
            hot: false,
            client: {
                overlay: false,
            },
            static: [
                'public',
                {
                    publicPath: '/charting-library',
                    directory: path.join(__dirname, 'src/charting-library')
                },
            ]
        }
    }

    /*
     * -------------------------------------------------------------
     * Watch
     * -------------------------------------------------------------
     */

    if (isDevelopment) {
        config.watchOptions = {
            aggregateTimeout: 100,
            ignored: /node_modules/,
        }
    }

    /*
     * -------------------------------------------------------------
     * Stats
     * -------------------------------------------------------------
     */

    config.stats = 'errors-warnings'

    return config
}
