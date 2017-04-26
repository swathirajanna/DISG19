
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
var url = require('url');

connection.query('USE ' + dbconfig.database);

module.exports = function(app, passport) {

	app.get('/', isNotLoggedIn, function(req, res) {
		var getquery = "select name, Spotify_url from Track where id in (select AT1.track_id from Artist_Track AT1 where AT1.artist_id = (select id1 from (select at1.artist_id as id1, at2.artist_id as id2, count(*) from Artist_Track at1 join Artist_Track at2 on at1.track_id=at2.track_id where at1.artist_id != at2.artist_id group by at1.artist_id, at2.artist_id order by count(*) desc) as T limit 1) and AT1.track_id in (select AT2.track_id from Artist_Track AT2 where AT2.artist_id = (select id2 from (select at1.artist_id as id1, at2.artist_id as id2, count(*) from Artist_Track at1 join Artist_Track at2 on at1.track_id=at2.track_id where at1.artist_id != at2.artist_id group by at1.artist_id, at2.artist_id order by count(*) desc) as T limit 1)))";
		connection.query(getquery, function(err, rows) {
			if (err)
				throw err;
			res.render('index.ejs',{sql:rows});
		});
	});


	app.post('/', function(req, res) {
        	var decade = req.body.decade;
		var getquery = "select name, Spotify_url from Track T1 inner join (select id from (select t.id, count(*) from Track t join Favorites f on t.id = f.track_id where t.year between ? and ? group by t.id order by count(*) desc)p) as T on T1.id = T.id limit 3"
			connection.query(getquery,[Number(decade), Number(decade)+9], function(err, rows) {
				if (err)
					throw err;
				if(rows.length>0)
					res.render('index_results.ejs',{sql:rows, message:''});
				else
					res.render('index_results.ejs',{sql:rows, message:'None Found'});
			});
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
		var getquery = "select name, Spotify_url from Track where id in (select AT1.track_id from Artist_Track AT1 where AT1.artist_id = (select id1 from (select at1.artist_id as id1, at2.artist_id as id2, count(*) from Artist_Track at1 join Artist_Track at2 on at1.track_id=at2.track_id where at1.artist_id != at2.artist_id group by at1.artist_id, at2.artist_id order by count(*) desc) as T limit 1) and AT1.track_id in (select AT2.track_id from Artist_Track AT2 where AT2.artist_id = (select id2 from (select at1.artist_id as id1, at2.artist_id as id2, count(*) from Artist_Track at1 join Artist_Track at2 on at1.track_id=at2.track_id where at1.artist_id != at2.artist_id group by at1.artist_id, at2.artist_id order by count(*) desc) as T limit 1)))";
		connection.query(getquery, function(err, rows) {
			if (err)
				throw err;
			res.render('profile.ejs',{sql:rows , user : req.user});
		});
	});




	app.post('/profile', function(req, res) {
        	var decade = req.body.decade;
		var getquery = "select name, Spotify_url from Track T1 inner join (select id from (select t.id, count(*) from Track t join Favorites f on t.id = f.track_id where t.year between ? and ? group by t.id order by count(*) desc)p) as T on T1.id = T.id limit 3"
			connection.query(getquery,[Number(decade), Number(decade)+9], function(err, rows) {
				if (err)
					throw err;
				if(rows.length>0)
					res.render('profile_results.ejs',{sql:rows, message:'' , user : req.user});
				else
					res.render('profile_results.ejs',{sql:rows, message:'None Found' , user : req.user});
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

	app.get('/display', isLoggedIn, function(req, res) {
		res.render('display.ejs', { message: req.flash('loginMessage') });
	});

	app.post('/display',  isLoggedIn, function(req, res) {
        	var query = req.body.tag
		console.log(query);
		var getquery = "SELECT * from "+query;
			connection.query(getquery, function(err, rows) {
				if (err)
					return done(err);
				res.render('display_results.ejs', {
					sql : rows
				});
			});
	});

	app.get('/search', isLoggedIn, function(req, res) {
		res.render('search.ejs', { message: req.flash('loginMessage') });
	});

	app.get('/favourites',isLoggedIn, function(req, res){
	var user = req.user.username;
	var getquery = "select * from Track where id in (SELECT track_id from Favorites where user_id = "+user+")";
				connection.query(getquery, function(err, rows) {
					if (err)
						throw err;
					if(rows.length>0){
						res.render('favourite_results.ejs', {
							sql : rows, message: ''
						});
					}
					else {
						res.render('favourite_results.ejs', {
							sql : rows, message: 'None Found'
						});
					}
				});
	});

	app.post('/favourites',isLoggedIn, function(req, res){
        var query = req.body.favourite;	
	var not = req.body.notfavourite;		
	var user = req.user.username;
		var msg = '';

	if (typeof not !== 'undefined' && not !== null){

var getquery = "delete from Favorites where user_id = "+user+" and track_id = "+not;

			connection.query(getquery, function(err, rows) {
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

	else
	{	var firstquery = "select * from Favorites where user_id = "+user+" and track_id = "+query;
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

		}
	});

	app.post('/search',  isLoggedIn, function(req, res) {
        var query = req.body.query,
	artist = req.body.artist,
	album = req.body.album,	
	table = req.body.tag;
		
	if (typeof artist !== 'undefined' && artist !== null){
		var getquery = "select name,theme,duration,year,Spotify_url from Track t where id in ( select track_id from (select at.track_id, count(*) from Artist_Track at join Favorites F on at.track_id = F.track_id where at.artist_id in (Select id from Artist where name like ?) group by at.track_id order by count(*)) ft) limit 3";
			connection.query(getquery,["%"+artist+"%"], function(err, rows) {
				if (err)
					throw err;
				if(rows.length>0){
					res.render('search_results.ejs', {
						sql : rows, message: ''
					});
				}
				else {
					res.render('search_results.ejs', {
						sql : rows, message: 'None Found'
					});
				}
			});
	}

	else if (typeof album !== 'undefined' && album !== null){

		var getquery = "select t.name,at.name from ((select id from Album where name = ?) ab Join (select id,name,album_id from Track) t on t.album_id= ab.id join Artist_Track trat on trat.track_id=t.id Join Artist at on at.id= trat.artist_id) order by t.name";

			connection.query(getquery,[album], function(err, rows) {
				if (err)
					throw err;
				if(rows.length>0){
					res.render('search_results.ejs', {
						sql : rows, message: ''
					});
				}
				else{
					res.render('search_results.ejs', {
						sql : rows, message: 'None Found'
					});
				}
			});

	}

	else {
		var getquery = "SELECT * from "+table+" where name like ?";
			connection.query(getquery,[query+"%"], function(err, rows) {
				if (err)
					throw err;
				res.render('search_results.ejs', {
					sql : rows, message: ''
				});
			});
		}
	});

	var temp;
	///////////////////RRRR/////////////////
	app.get('/playlist', function(req, res) {
		 //console.log(0);
		 mongodb.connect(database_mongo.url,function(err, db){
		 	//console.log(1);
		 db.collection('Collection_user', function (err, collection) {
		 	//console.log(2);
	try{
		 collection.find({user_id: req.user.username}).toArray(function(err, items) {
		    if(err) throw err;    
		    temp=items;
		    
		    //console.log("Done");
		    // alert("Done!"); 
			res.render('playlist.ejs', { items: temp, message: req.flash('loginMessage') }); 
		         
		});
	}

	catch(err){
		res.redirect('/');
	}
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
		 	//console.log("inside function");
		 	
		 	for(i=0;i<doc['song_id'].length;i++){
		 				resultArray2.push(doc['song_id'][i])
		 	}
			//console.log(resultArray2);
	     
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
				//console.log("Done");
				ctr2=0;
			 		for(m=0;m<resultArray.length;m++){
			 			if(resultArray[m]==resultArray2[0]){ctr2=1}
			 		}

				resultArray3.push(resultArray2[0]);
				console.log(resultArray)
				console.log(resultArray2)
		 		for(k=0;k<resultArray2.length;k++){
		 			ctr1=0;
			 		for(l=0;l<resultArray3.length;l++){
			 			if(resultArray3[l]==resultArray2[k]){ctr1=1}
			 		}
			 		
			 		if(ctr1==0){resultArray3.push(resultArray2[k])}
			 	}
			
			for(k=0;k<resultArray3.length;k++){
		 			ctr1=0;
			 		for(l=0;l<resultArray.length;l++){
			 			if(resultArray3[k]==resultArray[l]){resultArray3.splice(k, 1);}
			 		}
			 		
			 		// if(ctr1==0){resultArray3.push(resultArray2[k])}
			 	}

			 if((resultArray3[0])==undefined){
			 	//console.log("undef");
			 	resultArray3=["No recommendations"];}
			// console.log(resultArray3);
			
				res.render('add_songs.ejs', { items: resultArray, items1: resultArray1, items2: resultArray3, query : temp1, list: rows, message: req.flash('loginMessage') });
			});
		// res.render('profile.ejs', {
		// 	user : req.user
		// });
	});





	app.post('/add_songs', isLoggedIn, function(req, res) {
		//console.log("'"+req.user.username+"'");
        var query = req.body.query,
		s_id = req.body.tag;
		// name = req.body.name;
		//console.log("'"+temp1+"'");
		//console.log(s_id);
		var item={user_id: req.user.username,playlist_name:temp1}
		var item_insert={song_id: s_id}


		mongodb.connect(database_mongo.url,function(err, db){

		var cursor=db.collection('Collection_user').find({user_id: req.user.username, playlist_name: temp1},{song_id:1, _id:0});
		 cursor.forEach(function(doc,error){
		 resultArray=(doc['song_id']);
		 // console.log(resultArray);

		//console.log('Insertion started');
		assert.equal(null,err);
		// db.collection('Collection_user').update({user_id: "'"+req.user.username+"'", playlist_name: "'"+temp1+"'"}, {$push: {song_id: s_id}}, function(err, result){
		// // assert.equal(null,error);
		// // console.log('Item inserted');
		// // db.close();
		// });

		console.log()
		ctr=0;
		for(i=0;i<resultArray.length;i++){
			if(resultArray[i]==s_id){
				ctr++;
			}
		}
		if(ctr>0){
			res.redirect('/add_songs?tag='+temp1);
		}
		else{
			db.collection('Collection_user').update({user_id: req.user.username, playlist_name: temp1}, {$push: {song_id: s_id}}, {upsert:true});

		res.redirect('/add_songs?tag='+temp1);
		}
		
		});
		});
		});


	app.post('/remove_songs', isLoggedIn, function(req, res) {
		// console.log("'"+req.user.username+"'");
        var query = req.body.query,
		s_id = req.body.tag1;
		// // name = req.body.name;
		// console.log("'"+temp1+"'");
		//console.log("Here");
		//console.log(s_id);
		// var item={user_id: req.user.username,playlist_name:temp1}
		// var item_insert={song_id: s_id}


		mongodb.connect(database_mongo.url,function(err, db){
		//console.log('Insertion started');
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
		//console.log('Item inserted');
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

function isNotLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		res.redirect('/profile');

	else
		return next();
}

function sleep(ms){
	return new Promise(resolve => setTimeout(resolve, ms));
}
