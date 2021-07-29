// MIDDLEWARE FOR JWT TOKEN VERIFICATION
const userHelpers = require("../helpers/userHelpers");
const jwt= require('jsonwebtoken')
const {JWT_TOKEN}= require("../config/KEYS")
// this is auth
 const jwtVerify=(req,res,next)=>{
    const {authorization}=req.headers
    if(!authorization){
      return res.status(401).json({error:"you must be logged in,please login!"})
    }
    else{
      const key=authorization.replace("Bearer ","")
      // key=JSON.stringify(key)
      console.log(key);
      
      jwt.verify(key,JWT_TOKEN, async(err,payload) =>{
        if(err){
          return res.status(401).json({error:"you must be logged in2,please login!"})
        }
        else{
        const{_id} = payload
        console.log(_id)
       await userHelpers.findUser(_id).then((userData)=>{
        req.user=userData
        
      })
        next()
        }
      })
    }
  }

  module.exports =jwtVerify