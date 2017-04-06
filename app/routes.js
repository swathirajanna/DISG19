var LocalStrategy   = require('passport-local').Strategy;
var mysql = require('mysql');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);

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
					throw err;
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

	app.post('/search', function(req, res) {
        	var query = req.body.query,
		table = req.body.tag;
		var getquery = "SELECT * from "+table+" where name = ?";
			connection.query(getquery,[query], function(err, rows) {
				if (err)
					throw err;
				var data=[];
				for(i=0;i<rows.length;i++)
					{
					data.push(rows[i]);
					}
				res.end(JSON.stringify(data));
			});
	});

};

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}
