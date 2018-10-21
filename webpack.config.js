module.exports = {
	entry: "./main.js",
	output: {
		filename: "./bundle.js"
	},
	devtool: 'source-map',
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [
					'style-loader',
					'css-loader'
				]
			},
			{
 				test: /\.(png|svg|jpg|gif|dae)$/,
				use: [
					'file-loader'
					]
			}
       ],
}
};
