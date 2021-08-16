var express = require("express");
var router = express.Router();
const userHelpers = require("../helpers/userHelpers");
const jwtVerify = require("../Middlewares/tokenVerify");
const upload = require("../services/video-upload");

router.post("/setProfilePic", upload.setProfilePic);

router.get("/explorePosts/:id", (req, res) => {
  console.log("entered");
  userHelpers.getAllPosts(req.params.id).then((result) => {
    console.log(result);
    res.json(result);
  });
});
router.get("/myPosts", jwtVerify, (req, res) => {
  let id = req.user._id;
  userHelpers.getMyPosts(id).then((result) => {
    res.json(result);
  });
});
router.put("/like/:id", (req, res) => {
  try {
    userHelpers.likePost(req.body.userId, req.params.id).then((result) => {
      if (result == "disliked") {
        res.status(200).json("The like for this post is removed");
      } else {
        res.status(200).json("The post has been liked");
      }
    });
  } catch (err) {
    res.json(err);
  }
});
router.put("/comment/:id", (req, res) => {
  try {
    userHelpers.commentPost(req.body, req.params.id).then((comment) => {
      console.log(comment)
      res.status(200).json(comment);
    });
  } catch (err) {
    res.json(err);
  }
});
router.get("/userPosts/:id", (req, res) => {
  console.log("haaaaaaaaaaaaaaaaaaaaaaaaaa");
  userHelpers.getMyPosts(req.params.id).then((result) => {
    console.log(result);
    res.json(result);
  });
});
router.put("/countViews/:id", (req, res) => {
  // console.log("sameeh")
  userHelpers.countView(req.params.id).then(() => {

    res.json("added");
  });
});
// router.get("userPosts/:id",(req,res)=>{
// console.log("haaaaaaaaaaaaaaaaaaaaaaaaaa")
// userHelpers.userPosts(req.params.id).then((posts)=>{
// console.log(posts)
// res.status(200).json(posts)
// })
// })

module.exports = router;
