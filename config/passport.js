var LocalStrategy   = require('passport-local').Strategy;
var mysql = require('mysql');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);

var FacebookStrategy = require('passport-facebook').Strategy;//
var SpotifyStrategy = require('passport-spotify').Strategy;//

var configAuth = require('./auth');

connection.query('USE ' + dbconfig.database);

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
       done(null, user);
    });

    passport.use(
        'local-signup',
        new LocalStrategy({
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, username, password, done) {
            connection.query("SELECT * FROM Users WHERE username = ?",[username], function(err, rows) {
                if (err)
                    return done(err);

                if (rows.length) {//rows exist
                    return done(null, false, req.flash('signupMessage', 'Username already taken'));
                }

		else {//create new user
                    var newuser = {
			name: req.body.name,
                        username: username,
                        password: password
                    };

                    var insertQuery = "INSERT INTO Users ( name, username, password ) values (?,?,?)";

                    connection.query(insertQuery,[newuser.name, newuser.username, newuser.password],function(err, rows) {
                        newuser.id = rows.insertId;

                        return done(null, newuser);
                    });
                }
            });
        })
    );

    passport.use(
        'local-login',
        new LocalStrategy({
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, username, password, done) {
            connection.query("SELECT * FROM Users WHERE username = ?",[username], function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'No user found.'));
                }

                if (password!= rows[0].password)
                    return done(null, false, req.flash('loginMessage', 'Incorrect Password'));

                return done(null, rows[0]);
            });
        })
    );

	passport.use(new FacebookStrategy({

		clientID        : configAuth.facebookAuth.clientID,
		clientSecret    : configAuth.facebookAuth.clientSecret,
		callbackURL     : configAuth.facebookAuth.callbackURL

	    },

	    function(token, refreshToken, profile, done) {

		process.nextTick(function() {

		connection.query("SELECT * FROM Users WHERE username = ?",[profile.id], function(err, rows) {

		        if (err)
		            return done(err);

		        if (rows.length) {
                    	return done(null, rows[0]);
                	} else {
		            var newuser  = {
				name: profile.displayName,
		                username: profile.id,
		                password: token
		            };

		            var insertQuery = "INSERT INTO Users ( name, username, password ) values (?,?,?)";

		            connection.query(insertQuery,[newuser.name, newuser.username, newuser.password],function(err, rows) {
		                newuser.id = rows.insertId;

		                return done(null, newuser);
		            });
		        }

		    });
		});

	    }));


/*	passport.use(new SpotifyStrategy({
	    clientID		:  configAuth.spotifyAuth.clientID,
	    clientSecret	:  configAuth.spotifyAuth.client_secret,
	    callbackURL		: configAuth.spotifyAuth.callbackURL
	  },
	  function(accessToken, refreshToken, profile, done) {
	    process.nextTick(function() {

		//console.log(profile);
		connection.query("SELECT * FROM Users WHERE username = ?",[profile.id], function(err, rows) {

		        if (err)
		            return done(err);

		        if (rows.length) {
                    	return done(null, rows);
                	} else {
		            var newuser  = {
				name: profile.displayName,
		                username: profile.id,
		                password: accessToken
		            };

		            var insertQuery = "INSERT INTO Users ( name, username, password ) values (?,?,?)";

		            connection.query(insertQuery,[newuser.name, newuser.username, newuser.password],function(err, rows) {
		                newuser.id = rows.insertId;

		                return done(null, newuser);
		            });
		        }

		    });
		});
	  
	}));
*/
};

