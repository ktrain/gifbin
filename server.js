require('app-module-path').addPath('./shared');

var render = require('vitreum/steps/render')
var pageTemplate = require('./server/page.template.js');
var express = require("express");
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var app = express();
app.use(express.static(__dirname + '/build'));
app.use(bodyParser.json());
app.use(cookieParser());


var apigen = require('./server/apigen.js');
apigen.use(app);

//Admin panel creds
process.env.ADMIN_USER = process.env.ADMIN_USER || 'john';
process.env.ADMIN_PASS = process.env.ADMIN_PASS || 'secret';
process.env.ADMIN_KEY  = process.env.ADMIN_KEY  || 'admin';



//Models
var Gif = require('./server/gif.model.js')
Gif.generateRoutes();


//Admin route
var auth = require('basic-auth');
app.get('/admin', function(req, res){
	var credentials = auth(req)
	if (!credentials || credentials.name !== process.env.ADMIN_USER || credentials.pass !== process.env.ADMIN_PASS) {
		res.setHeader('WWW-Authenticate', 'Basic realm="example"')
		return res.status(401).send('Access denied')
	}
	Gif.model.find({}, function(err, gifs){
		render('admin', pageTemplate, {
			url: req.originalUrl,
			ADMIN_KEY : process.env.ADMIN_KEY,
			gifs : gifs
		})
			.then(res.send)
			.catch((err) => {
				console.error(err);
				res.status(500).send('Something went wrong');
			});
	});
});

//Admin Api Routes
var AdminApi = require('./server/api.admin.js');
AdminApi.addRoutes(app);


//Routes
app.get('*', function (req, res) {
	Gif.model.find({}, function(err, gifs){

		if(err || !gifs) return console.log('err', err);

		render('gifbin', pageTemplate, {
			gifs : gifs,
			url: req.originalUrl,
			cookies : req.cookies
		})
			.then(res.send)
			.catch((err) => {
				console.error(err);
				res.status(500).send('Something went wrong');
			});
	})
});


//Mongoose
var mongoose = require('mongoose');
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || process.env.MONGODB_URI || 'mongodb://localhost/gifbin';
mongoose.Promise = global.Promise;
mongoose.connect(mongoUri, { useMongoClient: true })
	.catch((err) => {
		throw new Error(`Could not connect to MongoDB: ${err.message}`);
	})
	.then(() => {
		var port = process.env.PORT || 8000;

		app.listen(port);
		console.info('Listening on', port);
	})
	.catch((err) => {
		console.error('Could not start server', err);
	});
