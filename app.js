const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const schedule = require('node-schedule');

const getNews = require("./parse_module");

const index = require('./routes');

const app = express();

const connection = mongoose.connect('mongodb://admin:admin@ds259117.mlab.com:59117/news');


mongoose.connection.on('connected', function(){
    mongoose.connection.db.listCollections().toArray(function (err, names) {
        if (err) {
            console.log("Connection error");
        } else {
            console.log("Connection success");
            if(names.length <= 1) {
                getNews();
                console.log("First time");
            }
        }
    });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

const timer = schedule.scheduleJob('*/20 * * * *', function () {
    getNews();
});


module.exports = app;
