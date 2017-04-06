var LocalStrategy   = require('passport-local').Strategy;
var mysql = require('mysql');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);

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
};
