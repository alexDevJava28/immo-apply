/**
 * Required External Modules
 */
const config = require('./../config/db.json');
const mongoose = require('mongoose');

/**
 * App Variables
 */
const dbConfig = config.mongodb;

/**
 *  App Configuration
 */

let dbConnectionOptions = {
    useNewUrlParser: true, 
    useUnifiedTopology: true
};

if (!dbConfig.user || !dbConfig.password) {
    mongoose.connect('mongodb://' + dbConfig.host + ':' + dbConfig.port + "/" + dbConfig.dbName, dbConnectionOptions);
} else {
    mongoose.connect('mongodb://' + dbConfig.user + ':' + dbConfig.password + "@" + dbConfig.host + ':' + dbConfig.port + "/" + dbConfig.dbName, dbConnectionOptions);
}

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {console.log("Connected to DB."); });

module.exports = db;