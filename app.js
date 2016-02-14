var express = require('express'),
  path = require('path'),
  sassMiddleware = require('node-sass-middleware')
  favicon = require('serve-favicon'),
  logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser');

var app = module.exports = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// sass-css compiler
app.use(sassMiddleware({
  src: path.join(__dirname, '/sass'),
  dest: path.join(__dirname, '/public/css'),
  debug: true,
  prefix: '/css'
}));
app.use(express.static(path.join(__dirname, 'public')));

// routing
// GET home page
app.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});

// GET series list
app.get('/series', function(req, res, next) {
  res.render('series', { title: 'Series' });
});

// GET serie with episode list
app.get('/serie/:id', function(req, res, next) {
  res.render('serie', { title: 'Serie', id: req.params.id });
});

// GET single episode
app.get('/episode/:id', function(req, res, next) {
  res.render('episode', { title: 'Episode ' });
});

// GET movies list
app.get('/movies', function(req, res, next) {
  res.render('movies', { title: 'Movies' });
});

// GET single movie
app.get('/movie/:id', function(req, res, next) {
  res.render('movie', { title: 'Movie' });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});