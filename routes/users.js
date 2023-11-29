var express = require('express');
var router = express.Router();
var mongoose=require('mongoose');
var plm= require('passport-local-mongoose');

mongoose.connect('mongodb://localhost/gmaaiiillllllll');

var userSchema= mongoose.Schema({
  username:String,
  password:String,
  name:String,
  profilepic:{
    default:"def.jpg",
    type:String
  },
  email:{
  type:String,
  unique:true
   },
  gender:String,
  mobile:String,
  sentmails:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"mail"
  }],
  receivedmails:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"mail"
  }]
});
 userSchema.plugin(plm);
 module.exports= mongoose.model('user',userSchema);
 
 module.export = router;
