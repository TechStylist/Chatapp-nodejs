var express = require('express');
const passport = require('passport');
var router = express.Router();
var user= require('./users');
var mailModel= require('./mail');
const localStrategy= require("passport-local");
const multer  = require('multer');

passport.use(new localStrategy(user.authenticate()));


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    const fn = Date.now() + Math.floor(Math.random * 100000000) + file.originalname
    cb(null, fn)
  }
})

function fileFilter (req, file, cb) {

  if(file.mimetype === "image/jpeg" || file.mimetype === "image/jpg" || file.mimetype === "image/png"|| file.mimetype === "image/svg")
    cb(null, true)
  else
    cb(new Error('tezz nako chalne ka yha pe smjha!'))
}

const upload = multer({ storage: storage,fileFilter:fileFilter })


router.get('/', function(req, res, next) {
  res.render('index');
});
router.post("/imgupload",isLoggedIn,upload.single('image'),async function(req,res){
  const loggedInUser=await user.findOne({username:req.session.passport.user})
  loggedInUser.profilepic = req.file.filename
  await loggedInUser.save();
  console.log(req.file)
  res.redirect("back")
 
})
router.get('/',redirectToProfile ,function(req, res, next) {
  res.render('/index');
});


router.post('/register',function(req,res,next){
 var newUser= new user({
  username:req.body.username,
  email:req.body.email,
  name:req.body.name,
  gender:req.body.gender,
  mobile:req.body.mobile,
  password:req.body.password
 
 })
 user.register(newUser, req.body.password)
 .then(function(registereduser){
  passport.authenticate('local')(req,res,function(){
    res.redirect('/profile');
  })
 })
 .catch(function(e){
  res.send(e);
 })
});
router.post('/compose',isLoggedIn,async function(req,res){
  const loggedInUser= await user.findOne({username:req.session.passport.user})
  
  const createdMail= await mailModel.create({
    userid: loggedInUser._id,
    receiver:req.body.email,
    mailtext:req.body.mailtext
  })
  loggedInUser.sentmails.push(createdMail._id);
  const loggedInUserUpdated= await loggedInUser.save();

  const receiverUser= await user.findOne({email:req.body.email});
  receiverUser?.receivedmails.push(createdMail._id);

  const updatedReceiverUser= await receiverUser?.save();
  res.send("chal gaya !")
  
})

router.get('/register', function(req, res, next) {
  res.render('register');
});
router.post('/login',passport.authenticate('local',{
  successRedirect:'/profile',
  failureRedirect:'/'
}));
router.get('/login', function(req, res, next) {
  res.render('index');
});
router.get('/logout',function(req,res,next){
  req.logOut(function(err){
    if(err) throw err;
    res.redirect('/');
  })
});
router.get('/profile',isLoggedIn,async function(req, res, next) {
 const loggedInUser=await user.findOne({username:req.session.passport.user})
  .populate({
    path:"receivedmails",
    populate:{
      path:'userid'
    }
  })
    res.render("profile",{userdata:loggedInUser})
  })

  // router.get("/delete/mail/:id",isLoggedIn,function(req,res){
  //   const loggedInUser=user.findOne({username:req.session.passport.user})
  //   .findOneAndDelete({id:req.body._id})
  //   .then(function(datadel){
  //     res.redirect("/sent");
  //   })
  // })

  router.get("/sent",isLoggedIn,async function(req,res,next){
    const loggedInUser=await user.findOne({username:req.session.passport.user})
    .populate("sentmails")
    res.render("sent",{user:loggedInUser})

    console.log(loggedInUser)
  })

  router.get('/check/:username',function(req,res){
    user.findOne({username:req.params.username})
    .then(function(user){
      res.json(user)
    })
  })
  

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  else{
   res.redirect('/')
  }
} 
function redirectToProfile(req,res,next){
  if(req.isAuthenticated()){
    res.redirect('/profile')
  }
  else{
    return next();
  }
} 


module.exports = router;
