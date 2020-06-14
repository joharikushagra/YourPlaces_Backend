const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');


const userSchema = new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true}, // unique speeds up queuing process 
    password:{type:String,required:true,minlength:6},
    image:{type:String,required:true},
    places:[{type: mongoose.Types.ObjectId,required:true,ref:'Place'}]    //links users and places
})

userSchema.plugin(uniqueValidator); //disallow pre existing email ids to add up

module.exports = mongoose.model('User',userSchema);