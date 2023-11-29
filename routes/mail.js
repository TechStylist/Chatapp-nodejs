var mongoose=require('mongoose');

var mailSchema = mongoose.Schema({
    receiver : String,
    mailtext : String,
    userid: {type:mongoose.Schema.Types.ObjectId, ref: 'user'}
});
module.exports= mongoose.model('mail',mailSchema);