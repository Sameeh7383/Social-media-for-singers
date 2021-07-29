var express = require('express');
var router = express.Router();
const userHelpers = require("../helpers/userHelpers");
const jwtVerify= require("../Middlewares/tokenVerify")
router.post("/addPost",jwtVerify,(req,res)=>{
    console.log(req.body)
    const{name,sources,description,category,url}=req.body
    if(!name||!sources||!description||!category||!url) return res.json({error:"please add all the fields"})
    
    req.user.password=undefined
    req.body.postedby=req.user
    req.body.date=new Date()
    userHelpers.addPost(req.body).then(()=>{res.json({message:"post added successfully"})})
    .catch((err)=>{console.log(err);})
})
router.get("/explorePosts",jwtVerify,(req,res)=>{
    userHelpers.getAllPosts().then((result)=>{
        console.log(result);
        res.json(result)

    })
})
router.get("/myPosts",jwtVerify,(req,res)=>{
    let id=req.user._id
    userHelpers.getMyPosts(id).then((result)=>{
        res.json(result)
    })
})
module.exports = router;