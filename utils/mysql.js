const mysql = require("mysql");
const login = require('../config.json');

const config = {
    host: login.database.mysql.host,
    user: login.database.mysql.user,
    password: login.database.mysql.password,
    database: login.database.mysql.database,
    supportBigNumbers: login.database.mysql.supportBigNumbers,
    bigNumberStrings: login.database.mysql.bigNumberStrings,
    multipleStatements: login.database.mysql.multipleStatements,
    charset: login.database.mysql.charset,
    connectionLimit: login.database.mysql.connectionLimit
}

const pool = mysql.createPool(config)
exports.con = pool;
exports.mysql = mysql;


// var con = mysql.createConnection({
//     host: login.database.mysql.host,
//     user: login.database.mysql.user,
//     password: login.database.mysql.password,
//     database: login.database.mysql.database,
// });

// con.connect(function(err) {
//     if (err) throw err;
//     console.log("Connected!");
// });