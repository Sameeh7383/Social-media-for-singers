var db = require("../config/connection");
var collections = require("../config/KEYS");
var bcrypt = require("bcrypt");
var { ObjectId, ObjectID } = require("mongodb");
const { response } = require("express");
const Razorpay = require("razorpay");
const referralCodeGenerator = require("referral-code-generator");
var instance = new Razorpay({
  key_id: "rzp_test_PAPzu6sjALb3dA",
  key_secret: "w8ZT3aja8JoSf0AV8drce3pY",
});
module.exports = {
  AddUser: (data) => {
    return new Promise((resolve, reject) => {
      console.log(data);
      db.get()
        .collection("user")
        .findOne({
          $or: [{ Email: data.Email }, { PhoneNumber: data.PhoneNumber }],
        })
        .then(async (UserData) => {
          if (UserData) {
            resolve("exist");
          } else {
            data.Password = await bcrypt.hash(data.Password, 10);
            data.following = [];
            data.followers = [];
            db.get()
              .collection("user")
              .insertOne(data)
              .then((result) => {
                console.log(result.ops[0]);
                resolve(result.ops[0]);
              });
          }
        });
    });
  },
  verifyUser: (data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection("user")
        .findOne({ Email: data.Email })
        .then((user) => {
          if (user) {
            bcrypt.compare(data.Password, user.Password).then((result) => {
              if (result) {
                resolve(user);
              } else {
                resolve("incorrect");
              }
            });
          } else {
            resolve("notExist");
          }
        });
    });
  },
  findUser: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection("user")
        .findOne({ _id: ObjectId(id) })
        .then((result) => {
          resolve(result);
        });
    });
  },
  addPost: (data) => {
    console.log(data);
    data.postedAt = new Date();
    data.likes = [];
    return new Promise((resolve, reject) => {
      console.log("enteredd in to promise");
      db.get()
        .collection("post")
        .insertOne(data)
        .then((data) => {
          resolve();
        });
    });
  },
  getAllPosts: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection("user")
        .findOne({ _id: ObjectId(userId) })
        .then((data) => {});
      db.get()
        .collection("user")
        .aggregate([
          { $match: { _id: ObjectId(userId) } },
          { $unwind: "$followings" },
          {
            $lookup: {
              from: "user",
              localField: "followings",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: "$user" },
          {
            $project: {
              _id: "$user._id",
              UserName: "$user.UserName",
              proPic: "$user.proPic",
            },
          },
          {
            $lookup: {
              from: "post",
              localField: "_id",
              foreignField: "postedBy",
              as: "post",
            },
          },
          { $unwind: "$post" }
        ])
        .toArray()
        .then((data) => {
          resolve(data);
        });
    });
  },
  getMyPosts: (userId) => {
    return new Promise((resolve, reject) => {
     console.log(userId);
      db.get().collection("user").aggregate([{$match:{_id: ObjectId(userId)}},
        {$lookup:{from:"post",localField:"_id",foreignField:"postedBy",as:"post"}},
      {$unwind:"$post"},
      {
        $project: {
          _id: "$_id",
          UserName: "$UserName",
          proPic: "$proPic",
          post:"$post"
        }
      },{$sort:{"post.postedAt":-1}}
    ])
    .toArray()
    .then((data)=>{
        // console.log(data)
        resolve(data)
        
      })
    });
  },
  likePost: (userId, postId) => {
    return new Promise((resolve, reject) => {
      console.log(userId, postId);
      db.get()
        .collection("post")
        .findOne({ _id: ObjectId(postId) })
        .then(async (data) => {
          let post=data
          // console.log(post.likes);
          console.log(post.likes.toString().includes((userId)))
          if (post.likes.includes(ObjectId(userId))) {
            
            await db
              .get()
              .collection("post")
              .updateOne(
                { _id: ObjectId(postId) },
                { $pull: { likes:ObjectId(userId)  } }
              );
            resolve("disliked");
          } else {
            await db
              .get()
              .collection("post")
              .updateOne(
                { _id: ObjectId(postId) },
                { $push: { likes:ObjectId(userId) } }
              );
            resolve("liked");
          }
        });
    });
  },
  commentPost: (data, post) => {
    return new Promise((resolve, reject) => {
      let comment = {
        comments: {
          postedBy: data.user,
          comment: data.comment,
          postedAt: new Date(),
          _id: new ObjectId(),
        },
      };
      db.get()
        .collection("post")
        .updateOne({ _id: ObjectId(post) }, { $push: comment })
        .then(() => {
          resolve(comment);
        });
    });
  },
  followUser: (user, followUser) => {
    return new Promise((resolve, reject) => {
      console.log(user, followUser);
      db.get()
        .collection("user")
        .findOne({ _id: ObjectId(user.id) })
        .then((result) => {
          if (result.followers.includes(ObjectId(followUser.userId))) {
            db.get()
              .collection("user")
              .updateOne(
                { _id: ObjectId(user.id) },
                { $pull: { followers: ObjectId(followUser.userId) } }
              )
              .then(async () => {
                await db
                  .get()
                  .collection("user")
                  .updateOne(
                    { _id: ObjectId(followUser.userId) },
                    { $pull: { followings: ObjectId(user.id) } }
                  );
                resolve("Unfollowed");
              });
          } else {
                db.get()
                  .collection("user")
                  .updateOne(
                    { _id: ObjectId(user.id) },
                    { $push: { followers: followUser.userId } }
                  )
                  .then(async () => {
                    await db
                      .get()
                      .collection("user")
                      .updateOne(
                        { _id: ObjectId(followUser.userId) },
                        { $push: { followings: ObjectId(user.id) } }
                      );
                    resolve("followed");
                  });
             
          }
        });
    });
  },
  userPosts: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection("post")
        .find({ "postedBy._id": userId })
        .toArray()
        .then((posts) => {
          resolve(posts);
        });
    });
  },
  editProfile: (userId, data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection("user")
        .updateOne({ _id: ObjectId(userId) }, { $set: data })
        .then(() => {
          db.get()
            .collection("user")
            .findOne({ _id: ObjectId(userId) })
            .then((data) => {
              resolve(data);
            });
        });
    });
  },
  countView: (postId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection("post")
        .updateOne({ _id: ObjectId(postId) }, { $inc: { views: 1 } })
        .then(() => {
          resolve();
        });
    });
  },
searchProfile:(searchKey)=>{
  return new Promise((resolve, reject) => {
db.get().collection('user').find({UserName:{$regex:searchKey}}).toArray().then((data)=>{
resolve(data)
})
})
  }
};
