
var LocalStrategy   = require('passport-local').Strategy;
var mysql = require('mysql');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);


///////////////RRRRRRRRR MongoDB connection//////////////////
var mongoose = require('mongoose'); 					// mongoose for mongodb
var mongodb = require('mongodb');
var database_mongo = require('./database_mongo'); 			// load the database config
var assert = require('assert');
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
//////////////RRRRRRRRR////////////////////////////////


connection.query('USE ' + dbconfig.database);

module.exports = function(app, passport) {

	app.get('/', function(req, res) {
		res.render('index.ejs'); //guest page
	});

	app.get('/login', function(req, res) {
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile',
            failureRedirect : '/login',
            failureFlash : true
		}),
        function(req, res) {
            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

	app.get('/signup', function(req, res) {
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile',
		failureRedirect : '/signup',
		failureFlash : true
	}));

	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user
		});
	});

	app.get('/account', isLoggedIn, function(req, res) {
		res.render('account_settings.ejs', {
			user : req.user
		});
	});

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	app.get('/display', function(req, res) {
		res.render('display.ejs', { message: req.flash('loginMessage') });
	});

	app.post('/display', function(req, res) {
        	var query = req.body.tag
		console.log(query);
		var getquery = "SELECT * from "+query;
			connection.query(getquery, function(err, rows) {
				if (err)
					return done(err);
				var data=[];
				for(i=0;i<rows.length;i++)
					{
					data.push(rows[i]);
					}
				res.render('display_results.ejs', {
					sql : rows
				});
			});
	});

	app.get('/search', function(req, res) {
		res.render('search.ejs', { message: req.flash('loginMessage') });
	});

	app.get('/favourites', function(req, res){
		res.render('favourite_results.ejs', { message: req.flash('loginMessage') });
	});

	app.post('/favourites', function(req, res){
        var query = req.body.favourite;		var user = req.user.username;
		var msg = '';

		var firstquery = "select * from Favorites where user_id = "+user+" and track_id = "+query;
		connection.query(firstquery, function(err, rows) {
			if (rows.length){
				msg = 'Songs already in favourites'
				res.render('favourite_results.ejs',{sql:rows, message: msg});
			}
			else{


			var getquery = "insert into Favorites (user_id, track_id) values ("+user+","+query+")";
					connection.query(getquery, function(err, result) {
						if (err){
							console.log(err);
						}
					});

			var getquery = "select * from Track where id in (SELECT track_id from Favorites where user_id = "+user+")";
				connection.query(getquery, function(err, rows) {
					if (err)
						throw err;
					res.render('favourite_results.ejs',{sql:rows, message:''});
				});

			}
		});

	});

	app.post('/search', function(req, res) {
        var query = req.body.query,
		table = req.body.tag;
		console.log(table);
		var getquery = "SELECT * from "+table+" where name like ?";
		//if(table = 'Artist')
		//	getquery = "select name from Track where id in (select top 3 track_id from ( select at.track_id, count(*) from Artist_Track at join Favorites F on at.track_id = F.track_id where artist_id = (Select artist_id from Artist where name = ? group by at.track_id order by count(*)))";
			connection.query(getquery,[query+"%"], function(err, rows) {
				if (err)
					throw err;
				var data=[];
				for(i=0;i<rows.length;i++)
					{
					data.push(rows[i]);
					}
				res.render('search_results.ejs', {
					sql : rows
				});
			});
	});
	var temp;
	///////////////////RRRR/////////////////
	app.get('/playlist', function(req, res) {
		 mongodb.connect(database_mongo.url,function(err, db){

		 db.collection('Collection_user', function (err, collection) {
         collection.find({user_id: req.user.username}).toArray(function(err, items) {
            if(err) throw err;    
            temp=items;
            console.log(temp);    
            res.render('playlist.ejs', { items: temp, message: req.flash('loginMessage') });        
        });
     	});
		// db.close();
		});
		
	});



	var temp1;

	app.post('/playlist', isLoggedIn, function(req, res) {
        var q = req.body.query,
		table = req.body.tag;
		temp1 = q;

		var query = req.body.query,
		table = req.body.tag;
		console.log(table);
		var getquery = "SELECT * from Track";
			connection.query(getquery,[query], function(err, rows) {
				if (err)
					throw err;
				var data=[];
				for(i=0;i<rows.length;i++)
					{
					data.push(rows[i]);
					}
				// res.end(JSON.stringify(data));
				res.render('create_playlist.ejs', { query : q, list: rows, message: req.flash('loginMessage') });
			});
	
	});

	app.get('/create_playlist', function(req, res) {

		var query = req.body.query,
		table = req.body.tag;
		console.log(table);
		var getquery = "SELECT * from Track";
			connection.query(getquery,[query], function(err, rows) {
				if (err)
					throw err;
				var data=[];
				for(i=0;i<rows.length;i++)
					{
					data.push(rows[i]);
					}
				// res.end(JSON.stringify(data));
				
				res.render('create_playlist.ejs', { query : q, list: rows, message: req.flash('loginMessage') });
			});
	});


	app.post('/create_playlist', isLoggedIn, function(req, res) {
		console.log(req.user.username);
        var query = req.body.query,
		table = req.body.tag;
		// name = req.body.name;
		// console.log(query[1]);
		var item={user_id: req.user.username,playlist_id: '',playlist_name:temp1}


		mongodb.connect(database_mongo.url,function(err, db){
		assert.equal(null,err);
		db.collection('Collection_user').insertOne(item, function(err, result){
		// assert.equal(null,error);
		console.log('Item inserted');
		db.close();
		});
		});
		res.redirect('/playlist');
		

	});

	/////////RRRR////////

};

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}

function sleep(ms){
	return new Promise(resolve => setTimeout(resolve, ms));
}
