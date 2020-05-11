var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
mongoose.connect("mongodb://localhost:27017/atmUsers", { useNewUrlParser: true }).then(()=>{
    console.log("Database connected");
}).catch(()=>{
    console.log("Error connecting to database !!");
});
const Card = require('./models/Card')
var app = express();
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); 
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");  
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT"); 
  next();              
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/register',(req,res,next) => {
   if(req.body.cardNum.length === 8 && req.body.pin.length===4) {
    Card.findOne({cardNum:req.body.cardNum})
    .then((card) => {
      console.log(card.cardNum)
      if(card) {
       res.status(403).json({
         status:false,
         message:"Card already registered"
       })
      } else {
        bcrypt.hash(req.body.pin, 10)            // hash function to encrypt the password using random number before passing to databse
        .then(hash => {
          const newCard = new Card({
            cardNum:req.body.cardNum,
            pin:hash
          })
          return  newCard.save(); 
        })
      }
    })
    .then((card) => {
      res.status(200).json({status:true,message:"Card is Registered successfully"})
  })
  .catch(err => {
    res.status(403).json({status:false,message:"Card Registration failed",error: err});
  })
   } else{
    res.status(403).json({status:false,message:"Invalid inputs"});
   }
})
app.post('/validate', (req,res) => {
  const cardNum = req.body.cardNum;
  let card;
  Card.findOne({ cardNum: cardNum }).then(response => {
    console.log(response)
      if (!response) {
          return res.status(401).json({
              status: false,
              message: "No card found with this crendential"
          });
      }
      card =response;
     
      return bcrypt.compare(req.body.pin, response.pin);
  })
      .then(result => {
        console.log(response)
          if (!result) {
              return res.status(403).json({
                  status: false,
                  message: "Incorrect pin"
              });
          }
           res.status(200).json({
              status: true,
              message:"Card Validated successfully"
          });
      })
      .catch(error => {
          return res.status(403).json({
              status: false,
              message: "Incorrect details",
              error:error
          });

      })
})
app.post('/deposit',(req,res) =>{

})
app.post('/withdraw',(req,res) =>{

})
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
