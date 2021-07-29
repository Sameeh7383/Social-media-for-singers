var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fileUpload=require('express-fileupload')
var db= require('./config/connection')
var session= require('express-session')
const { MongoBulkWriteError } = require('mongodb')
const mongoose = require('mongoose')
const {MONGOURI}= require('./config/connection')
// var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var postRouter = require('./routes/post');
var cors = require('cors')


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(cors())
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:"its a secret",cookie:{maxAge:60000000}}))
app.use(fileUpload())

db.connect((err)=>{
  if(err) console.log("connection error:"+err)
  else console.log("database connected") 
  })
  
// mongoose.connect(MONGOURI,{useUnifiedTopology: true,
//   useNewUrlParser: true})
// mongoose.connection.on('connected',()=>{
//     console.log("db connected");
// })
// mongoose.connection.on('error',(err)=>{
//     console.log("error in connection with mongodb",err);
// })


app.use('/', usersRouter);
app.use('/post', postRouter);
// app.use('/admin',adminRouter)


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

module.exports = app;
