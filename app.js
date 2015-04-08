/**
 * Created by User on 07.04.2015.
 */

var express = require('express');
var path = require('path');
var cons = require('consolidate');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var http = require('http');
var port;
var server;
var config;
var session = require('express-session');
var MemoryStore = require('connect-redis')(session);
var knex;
var PostGre;
var Models;

app.engine('html', cons.swig);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(logger('dev'));
app.use(bodyParser.json({strict: false, inflate: false, limit: 1024 * 1024 * 200}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*if (app.get('env') === 'development') {
    require('./config/development');
} else {
    require('./config/production');
}*/
require('./config/production');
/*config = {
 db: 7,
 host: process.env.REDIS_HOST,
 port: parseInt(process.env.REDIS_PORT) || 6379
 };*/

app.use(session({
    name: 'testCall',
    secret: '1q2w3e4r5tdhgkdfhgejflkejgkdlgh8j0jge4547hh',
    resave: true,
    saveUninitialized: true
    //  store: new MemoryStore(config)
}));

knex = require('knex')({
    debug: true,
    client: 'pg',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME
        //charset: 'utf8'
    }
});

PostGre = require('bookshelf')(knex);

Models = require('./models/index');
Collections = require('./collections/index');

PostGre.Models = new Models(PostGre);
PostGre.Collections = new Collections(PostGre);

require('./routes/index')(app, PostGre);

port = parseInt(process.env.PORT) || 8823;
server = http.createServer(app);

server.listen(port, function () {
    console.log('Express start on port ' + port);
});

module.exports = app;