var mysql = require('mysql');
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('Select * from ' + dbconfig.database);
console.log('Success: Database Created!')

connection.end();
