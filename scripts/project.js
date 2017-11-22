module.exports = {
	entryPoints: {
		gifbin: './client/gifbin/gifbin.jsx',
		admin: './client/admin/admin.jsx'
	},
	clientPath: './client',
	sharedPaths: ['./shared'],
	assetExts: ['*.svg', '*.png', '*.ico'],
	serverScript: './server.js',
	serverPaths: ['./server/'],
	libs: [
		'react',
		'react-dom',
		'lodash',
		'classnames',
		'superagent',
		'moment',
		'marked',
		'url',
		'pico-router',
		'pico-flux',
	]
};
