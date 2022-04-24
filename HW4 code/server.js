var createError = require('http-errors');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var flash = require('express-flash');
var session = require('express-session');
//const { exec } = require("child_process");
const { readFileSync } = require('fs');
var exec = require('ssh-exec');
var http = require('http');
var app = express();
const fs = require('fs')
const {PythonShell} =require('python-shell');


app.get('/result', function(req,res){
        exec(`python3 test.py "test connection"`, {
  user: 'zhihuiw328',
  host: '10.128.0.3',
  key: fs.readFileSync('../a')
}, function (err, stdout, stderr) {
  res.send(stdout);
});
});
var jsonParser = bodyParser.json();
app.post('/getBestTerms',jsonParser,function(req, res, next) {
        var website = JSON.stringify(req.body.website);
        var query = `python3 query4.py ${website}`;
        //res.send(query);
        exec(query, {
                user: 'zhihuiw328',
                host: '10.128.0.3',
                key: fs.readFileSync('../a')
        }, function (err, stdout, stderr) {
                console.log(stdout);
                res.send(stdout);
        });
});

app.post('/results', jsonParser,function(req, res, next) {
        var term = JSON.stringify(req.body.term);
        var query = `python3 query1.py ${term}`;
        //res.send(query);
        exec(query, {
                user: 'zhihuiw328',
                host: '10.128.0.3',
                key: fs.readFileSync('../a')
        }, function (err, stdout, stderr) {
                console.log(stdout);
                res.send(stdout);
        });
        });
});

app.post('/trends',jsonParser,function(req, res, next) {
        var term = JSON.stringify(req.body.term);
        var query = `python3 query2.py ${term}`;
        //res.send(query);
        exec(query, {
                user: 'zhihuiw328',
                host: '10.128.0.3',
                key: fs.readFileSync('../a')
        }, function (err, stdout, stderr) {
                console.log(stdout);
                res.send(stdout);
        });
});

app.post('/popularity',jsonParser,function(req, res, next) {
        var url = JSON.stringify(req.body.url);
        var query = `python3 query3.py ${url}`;
        //res.send(query);
        exec(query, {
                user: 'zhihuiw328',
                host: '10.128.0.3',
                key: fs.readFileSync('../a')
        }, function (err, stdout, stderr) {
                console.log(stdout);
                res.send(stdout);
        });
});  


// set up ejs view engine 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(__dirname + '../public'));

app.use(session({ 
    secret: '123456catr',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))
app.use(bodyParser.json());
app.use(flash());


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
  });
   
  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
   
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });
   
  // port must be set to 3000 because incoming http requests are routed from port 80 to port 8$
  app.listen(80, function () {
      console.log('Node app is running on port 80');
  });
  module.exports = app;
