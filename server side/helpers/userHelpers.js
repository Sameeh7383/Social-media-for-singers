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
    return new Promise( (resolve, reject) => {
      console.log(data);
      db.get()
        .collection("user")
        .findOne({ $or: [{ email: data.email }, { phoneNumber: data.phone }] })
        .then(async (UserData) => {
          if (UserData) {
            resolve("exist");
          } else {
            data.password = await bcrypt.hash(data.password, 10);
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
  verifyUser:(data)=>{
    return new Promise( (resolve, reject) => {
      db.get().collection("user").findOne({email:data.email}).then((user)=>{
        if(user){
          bcrypt.compare(data.password,user.password).then((result) =>{
            if(result){
              resolve(user)
            }
            else{
              resolve("incorrect")
            }
          })

        }
        else{
          resolve("notExist")
        }
      })
    })
  },
  findUser:(id)=>{
    return new Promise( (resolve, reject) => {
db.get().collection("user").findOne({_id: ObjectId(id)}).then((result) => {
resolve(result)
})
    })
  },
  addPost:(data)=>{
    console.log(data);
    return new Promise((resolve, reject) =>{
      console.log("enteredd in to promise");
      db.get().collection("post").insertOne(data).then((data)=>{
        resolve()

      })
    })
  },
  getAllPosts:()=>{
    return new Promise( (resolve, reject) => {
      db.get().collection("post").find().sort({date:-1}).toArray().then((result)=>{
        resolve(result)
      })
    })
   
  },
  getMyPosts:(userId)=>{
    return new Promise( (resolve, reject) => {
      db.get().collection("post").find({"postedby._id":userId}).sort({date:-1}).toArray().then((result)=>{
        resolve(result)

      })

    })
  }
};
