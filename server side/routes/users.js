var express = require('express');
var router = express.Router();
const userHelpers = require("../helpers/userHelpers");
const jwt= require('jsonwebtoken')
const {JWT_TOKEN}= require("../config/KEYS")
jwtVerify=require("../Middlewares/tokenVerify")
var cors = require('cors')
/* GET users listing. */
router.get('/',function(req, res, next) {
  res.render('test');
});

router.post('/signUp',(req,res)=>{
 
    userHelpers.AddUser(req.body).then((userData)=>{
      if(userData=="exist"){
        res.status(422).json({error:"user already exists"})
      }
      else{
      req.session.user=userData
      res.json({message:"Sign Up Success!! You Can Login Now"})}
    }).catch(err=> {console.log(err)})
  

  

})

router.post('/login',(req,res)=>{
  const{email,password}=req.body
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
      console.log(result)
      res.json({jwt:jwtToken,user:result})
    }
  }).catch(err=> {console.log(err)})
})
router.get('/UserProfile/:id',(req,res)=>{
userHelpers.findUser(req.params.id).then((user)=>{
  console.log(user)
  res.status(200).json(user)
})
})
router.put('/followUser/:id',(req,res)=>{
userHelpers.followUser(req.params,req.body).then((data)=>{
 res.status(200).json(data)
})
})
router.post('/updateProfile/:id',(req,res)=>{
  userHelpers.editProfile(req.params.id,req.body).then((data)=>{
   res.status(200).json(data)
  })
  })
  router.get('/SearchProfile/:searchKey',(req,res)=>{
    userHelpers.searchProfile(req.params.searchKey).then((data)=>{
      console.log(data)
      res.status(200).json(data)
    })
    })
module.exports = router;
