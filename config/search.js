var LocalStrategy   = require('passport-local').Strategy;
var mysql = require('mysql');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

module.exports = function(searcher) {
	app.use(function(req, query, tag){
	var getquery = "SELECT * from Users where ? like ?";
	connection.query(getquery[tag,query], function(err, rows, fields) {
		if (err)
			throw err;
		var data=[];
		for(i=0;i<rows.length;i++)
			{
			data.push(rows[i].first_name);
			}
		res.end(JSON.stringify(data));
		});
	});
};
