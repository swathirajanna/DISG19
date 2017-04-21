
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
var url = require('url')


connection.query('USE ' + dbconfig.database);

module.exports = function(app, passport) {

	app.get('/', function(req, res) {
		res.render('index.ejs'); //guest page
	});

	app.get('/login', function(req, res) {
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

    	// handle the callback after facebook has authenticated the user
    	app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

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
		 console.log(0);
		 mongodb.connect(database_mongo.url,function(err, db){
		 	console.log(1);
		 db.collection('Collection_user', function (err, collection) {
		 	console.log(2);
         collection.find({user_id: req.user.username}).toArray(function(err, items) {
            if(err) throw err;    
            temp=items;
            
            console.log("Done");
            // alert("Done!"); 
		res.render('playlist.ejs', { items: temp, message: req.flash('loginMessage') }); 
                 
        });
     	});
		// db.close();
		});	
		console.log(11)
	});



	

	app.post('/playlist', isLoggedIn, function(req, res) {
        var q = req.body.query,
		table = req.body.tag;
		temp1 = q;

		var query = req.body.query,
		table = req.body.tag;
		// console.log(table);
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
				// res.render('playlist.ejs');
				//res.render('create_playlist.ejs', { query : query, list: rows, message: req.flash('loginMessage') });
			});
	});


	app.post('/create_playlist', isLoggedIn, function(req, res) {
		// console.log(req.user.username);
        var query = req.body.query,
		table = req.body.tag;
		// name = req.body.name;
		// console.log(query);
		var item={user_id: req.user.username,playlist_name:query,song_id:[]}


		mongodb.connect(database_mongo.url,function(err, db){
		assert.equal(null,err);
		db.collection('Collection_user').insertOne(item, function(err, result){
		// assert.equal(null,error);
		console.log('Item inserted');
		db.close();
		});
		});

		// var item1={user_id: req.user.username,playlist_name:temp1} 
		// mongodb.connect(database_mongo.url,function(err, db){
		// assert.equal(null,err);
		// db.collection('Collection_songs').insertOne(item1, function(err, result){
		// // assert.equal(null,error);
		// console.log('Item inserted');
		// db.close();
		// });
		// });

		res.redirect('/playlist');
		// res.render('playlist.ejs');
	});


	var temp1;
	var temp2;


	app.get('/add_songs', isLoggedIn, function(req, res) {
		var resultArray=[];
		var resultArray1=[];
		var resultArray2=[];
		var resultArray3=[];
		query=req.query.tag;     //name of playlist
		temp1=query;
		// console.log(req);
		// console.log(req.user.username);
		// console.log(temp1);

		 mongodb.connect(database_mongo.url,function(err, db){
		 var cursor=db.collection('Collection_user').find({user_id: req.user.username, playlist_name: temp1},{song_id:1, _id:0});
		 cursor.forEach(function(doc,error){
		 // console.log(doc['song_id']);
		 resultArray=(doc['song_id']);
		
			var cursor1=(db.collection('Collection_user').find({song_id: {$in: resultArray},  user_id: { $ne: req.user.username } },{user_id:1, _id:0}));
			cursor1.forEach(function(doc1,error){
			resultArray1.push(doc1['user_id']);
			// console.log(resultArray1);

			var cursor2=db.collection('Collection_user').find({user_id: {$in: resultArray1}},{song_id:1, _id:0});
		 	cursor2.forEach(function(doc,error){
		 	console.log("inside function");
		 	
		 	for(i=0;i<doc['song_id'].length;i++){resultArray2.push(doc['song_id'][i])}
			console.log(resultArray2);
	     
		 });
		});
		 });
		});
	    

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
				// res.render('playlist.ejs');
				console.log("Done");
				
				resultArray3.push(resultArray2[0]);
		 		for(k=0;k<resultArray2.length;k++){
		 			ctr=0;
			 		for(l=0;l<resultArray3.length;l++){
			 			if(resultArray3[l]==resultArray2[k]){ctr=1}
			 		}
			 		if(ctr==0){resultArray3.push(resultArray2[k])}
			 	}
			 console.log(resultArray3[0])
			 if((resultArray3[0])==undefined){
			 	console.log("undef");
			 	resultArray3=["No recommendations"];}
			 console.log(resultArray3);
				res.render('add_songs.ejs', { items: resultArray, items1: resultArray1, items2: resultArray3, query : temp1, list: rows, message: req.flash('loginMessage') });
			});
		// res.render('profile.ejs', {
		// 	user : req.user
		// });
	});





	app.post('/add_songs', isLoggedIn, function(req, res) {
		console.log("'"+req.user.username+"'");
        var query = req.body.query,
		s_id = req.body.tag;
		// name = req.body.name;
		console.log("'"+temp1+"'");
		console.log(s_id);
		var item={user_id: req.user.username,playlist_name:temp1}
		var item_insert={song_id: s_id}


		mongodb.connect(database_mongo.url,function(err, db){
		console.log('Insertion started');
		assert.equal(null,err);
		// db.collection('Collection_user').update({user_id: "'"+req.user.username+"'", playlist_name: "'"+temp1+"'"}, {$push: {song_id: s_id}}, function(err, result){
		// // assert.equal(null,error);
		// // console.log('Item inserted');
		// // db.close();
		// });

		db.collection('Collection_user').update({user_id: req.user.username, playlist_name: temp1}, {$push: {song_id: s_id}});

		res.redirect('/add_songs?tag='+temp1);
		});
		
		});


	app.post('/remove_songs', isLoggedIn, function(req, res) {
		// console.log("'"+req.user.username+"'");
        var query = req.body.query,
		s_id = req.body.tag1;
		// // name = req.body.name;
		// console.log("'"+temp1+"'");
		console.log("Here");
		console.log(s_id);
		// var item={user_id: req.user.username,playlist_name:temp1}
		// var item_insert={song_id: s_id}


		mongodb.connect(database_mongo.url,function(err, db){
		console.log('Insertion started');
		assert.equal(null,err);
		// // db.collection('Collection_user').update({user_id: "'"+req.user.username+"'", playlist_name: "'"+temp1+"'"}, {$push: {song_id: s_id}}, function(err, result){
		// // // assert.equal(null,error);
		// // // console.log('Item inserted');
		// // // db.close();
		// // });

		db.collection('Collection_user').update({user_id: req.user.username, playlist_name: temp1}, {$pull: {song_id: s_id}});

		res.redirect('/add_songs?tag='+temp1);
		});
		
		});

	app.post('/add_songs_update', isLoggedIn, function(req, res) {
		// console.log(req.user.username);
        var query = req.body.query,
		table = req.body.tag;
		// name = req.body.name;
		// console.log(query);
		var item={user_id: req.user.username,playlist_id: '',playlist_name:query}


		mongodb.connect(database_mongo.url,function(err, db){
		assert.equal(null,err);
		db.collection('Collection_songs').insertOne(item, function(err, result){
		// assert.equal(null,error);
		console.log('Item inserted');
		db.close();
		});
		});

		// var item1={user_id: req.user.username,playlist_name:temp1} 
		// mongodb.connect(database_mongo.url,function(err, db){
		// assert.equal(null,err);
		// db.collection('Collection_songs').insertOne(item1, function(err, result){
		// // assert.equal(null,error);
		// console.log('Item inserted');
		// db.close();
		// });
		// });

		res.redirect('/playlist');
		// res.render('playlist.ejs');
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
