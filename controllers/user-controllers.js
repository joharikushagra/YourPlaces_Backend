const { v4: uuidv4 } = require('uuid')
const HttpError  = require('../models/http-error')
const {validationResult} = require('express-validator');
const User = require('../models/user');
const user = require('../models/user');
const mongoose = require('mongoose');



const getUsers = async (req,res,next)=>{
 
    let users;
  
try{
  users = await User.find({},'-password',)
}catch(err){
    const error = new HttpError('cannot fetch users',500);
    return next(error);
}

  res.json({users:users.map(u=> u.toObject({getters:true}))});
};

const signup = async (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return next(new HttpError('invalid user inputs',422));
    }
    
const {name,email,password} = req.body;

let existingUser;
try{
existingUser =await User.findOne({email:email})
}catch(err){
    console.log(error);
    
    const error = new HttpError('signing up failed,try again later',500);
    return next(error);
}

if(existingUser){
    const error = new HttpError('user already exist,login instead',422)
    return next(error);
}

const createdUser = new User({
    id:uuidv4(),
    name,
    email,
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/66/The_Leaning_Tower_of_Pisa_SB.jpeg',
    password,
    places:[]
})

try{
    await createdUser.save();
} catch(err){
    const error = new HttpError('signing up failed,try again later',500);
    return next(error);
}

res.status(201).json({user:createdUser.toObject({getters:true})});
} 

const login = async (req,res,next)=>{
const {email,password} = req.body;

let existingUser;
try{
existingUser =await User.findOne({email:email})
} catch(err){
    console.log(error);
    
    const error = new HttpError('Logging in failed,try again later',500);
    return next(error);
}

if(!existingUser || existingUser.password!==password){
    const error = new HttpError('Invalid credentials,could not log you in',500);
    return next(error)
}

 res.json({message:'logged in', user:existingUser.toObject({getters:true})});
}




exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;