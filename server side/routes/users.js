var express = require('express');
var router = express.Router();
const userHelpers = require("../helpers/userHelpers");
const jwt= require('jsonwebtoken')
const {JWT_TOKEN}= require("../config/KEYS")
jwtVerify=require("../Middlewares/tokenVerify")
var cors = require('cors')
/* GET users listing. */
router.get('/',jwtVerify,function(req, res, next) {
  res.send('Hello man lets start a new revolution');
});

router.post('/signUp',(req,res)=>{
 
  const {name,email,password,phone}=req.body
  console.log(name,email,password,phone);
  if(!name||!email||!password||!phone){
    res.status(422).json({error:"please add all fields"}) 
  }
  else{
    userHelpers.AddUser(req.body).then((userData)=>{
      if(userData=="exist"){
        res.status(422).json({error:"user already exists"})
      }
      else{
      req.session.user=userData
      res.json({message:"Sign Up Success!! You Can Login Now"})}
    }).catch(err=> {console.log(err)})
  

  }

})

router.post('/login',(req,res)=>{
  const{email,password}=req.body
  if(!password||!email){
    res.status(422).json({error:"Please Enter Your Credentials Correctly"}) 
  }
  userHelpers.verifyUser(req.body).then((result)=>{
    if(result=="incorrect"){
      res.status(422).json({error:"Invalid Username Or Password"})
    }
    else if(result=="notExist"){
      res.status(422).json({error:"Invalid Username Or Password"})

    }
    else{
      // res.json({message:"login success"})
      jwtSecret="mnbgfdsaA"
      const jwtToken=jwt.sign({_id:result._id},JWT_TOKEN)
      console.log(jwtToken)
      res.json({jwt:jwtToken,user:result})
    }
  }).catch(err=> {console.log(err)})
})

module.exports = router;
