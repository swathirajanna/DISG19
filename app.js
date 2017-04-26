var express  = require('express');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app      = express();
var port     = process.env.PORT || 8080;

var passport = require('passport');
var flash    = require('connect-flash');


//////////////RRRRRRRRR/////////////
var mongoose = require('mongoose'); 					// mongoose for mongodb
var mongodb = require('mongodb');
var database_mongo = require('./config/database_mongo'); 			// load the database config
var assert = require('assert');
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)

var item={user_id: 1,playlist_id: 232,playlist_name:'xyz'}

// mongodb.connect(database_mongo.url,function(err, db){
// 	assert.equal(null,err);
// 	db.collection('Collection_user').insertOne(item, function(err, result){
// 		// assert.equal(null,error);
// 		console.log('Item inserted');
// 		db.close();
// 	});
// });

// mongodb.connect(database_mongo.url,function(err, db){
// 	 db.collection('Collection_user', function (err, collection) {
        
//          collection.find().toArray(function(err, items) {
//             if(err) throw err;    
//             console.log(items);            
//         });
        
//     });
// 	// db.close();
// });


////////////RRRRRRRRRR/////////////////

require('./config/passport')(passport);

app.use(morgan('dev')); 
app.use(cookieParser()); 
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs'); 
//passport
app.use(session({
	secret: 'databaseproject',
	resave: true,
	saveUninitialized: true
 } ));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//routes
require('./app/routes.js')(app, passport);
app.use(express.static(__dirname + '/public'));
app.listen(port);
console.log('Server on port ' + port);
