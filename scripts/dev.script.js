const label = 'dev';
console.time(label);

const _ = require('lodash');
const steps = require('vitreum/steps');
const project = require('./project.js');

Promise.all(_.map(project.entryPoints, (path, name) => {
	return steps.jsxWatch(name, path, { libs: project.libs, shared: project.sharedPaths })
		.then((deps) => steps.lessWatch(name, { shared: project.sharedPaths }, deps));
}))
	.then(() => steps.assetsWatch(project.assetExts, project.assetsPath))
	.then(() => steps.livereload())
	.then(() => steps.serverWatch(project.serverScript, project.serverPaths))
	.then(() => console.timeEnd(label))
	.catch(console.error);
