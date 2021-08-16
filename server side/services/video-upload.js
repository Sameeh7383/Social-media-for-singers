const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const userHelpers = require("../helpers/userHelpers");
const s3 = new aws.S3({
    accessKeyId: "AKIATI5UOAYSA62XWVOO",
    secretAccessKey:"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",
    region: 'ap-south-1',
  });



  const upload = (bucketName) =>
  multer({
    storage: multerS3({
      s3,
      bucket: bucketName,
      acl: 'public-read',
      metadata: function (req, file, cb) { 
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        cb(null, `image-${Date.now()}.mp4`);
      },
    }),
  });
  exports.setProfilePic = (req, res, next) => {
    
    const uploadSingle = upload("singram").single(
      "file"
    );
    uploadSingle(req, res, async (err) => {
      
      if (err)
        return res.status(400).json({ success: false, message: err.message });
  
    //   await User.create({ photoUrl: req.file.location });
      req.body.postedBy=JSON.parse(req.body.postedBy)
      console.log(req.file.location);
      req.body.url=req.file.location
      req.body.comments=[]
      await userHelpers.addPost(req.body)
      res.status(200).json({ formData: req.file.location });
    });
  };
