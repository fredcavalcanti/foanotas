var createError = require('http-errors');
var express = require('express');
const cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var port = process.env.PORT || 2000;

var app = express();

app.set('port', port);

const server = require('http').Server(app);

var indexRouter = require('./src/routes/index');

//app.use(logger('dev'));
app.use(cors({origin: '*'}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(__dirname + '/src/views'));
app.set('views', __dirname + '/src/views');
app.engine('html', require('ejs').renderFile);

app.use('/', indexRouter);


server.listen(port);
