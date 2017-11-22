'use strict';

const _ = require('lodash');
const label = 'build';
console.time(label);

const steps = require('vitreum/steps');
const project = require('./project.js');

steps.clean()
	.then(() => steps.libs(project.libs))
	.then(() => {
		return Promise.all(_.map(project.entryPoints, (path, name) => {
			return steps.jsx(name, path, { libs: project.libs, shared: project.sharedPaths })
				.then((deps) => steps.less(name, { shared: project.sharedPaths }, deps));
		}));
	})
	.then(() => steps.assets(project.assetExts, [project.clientPath]))
	.then(() => console.timeEnd(label))
	.catch(console.error);
