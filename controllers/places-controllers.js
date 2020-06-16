const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator"); //validationresult is function in validator package
const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../routes/util/location");
const Place = require("../models/place");
const User = require('../models/user');
const mongoose = require("mongoose");
const lodash = require('lodash');
const fs=require('fs')


//====================================================
const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid; //{pid:'p1'}

  let place;

  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError("could not find a place", 500);
    return next(error);
  }
  // res.json({message:'It works'}); //encode to json format

  if (!place) {
    // return  res.status(404).json({messge:"Could not find place for the provided id."});
    const error = new HttpError("could not find for provided id", 404);
    return next(error);
  }

  res.json({ place: place.toObject({getters:true})}); //converts data into object along with id(id getters function)
};
//====================================================


//====================================================
const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  
  let places;
  try{
  places = await Place.find({creator:userId})
  } catch(err){
    const error = new HttpError('could not find place with entered userid',500);
    return next(error);
  }

  if (!places || places.length === 0) {
    // return  res.status(404).json({messge:"Could not find place for the provided id."});
    return next(new HttpError("could not find for provided id", 404));
  }
  res.json({ places: places.map(p=> p.toObject({getters:true})) });
};
//====================================================

//====================================================
const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
   
    return next(new HttpError("invaild inputs", 422));
  }

  const { title, description, address } = req.body; //const title= req.body.title
  let coordinates;

  coordinates = getCoordsForAddress(address);

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator: req.userData.userId
  });


  let user;

  try{
    user= await User.findById(req.userData.userId)

  } catch(err){
    const error = new HttpError('creating place failed,try again',500);
    return next(error);
  }



  if(!user){
    const error = new HttpError('could not find user by provided id',500);
    return next(error);
  }


  try {
   const sess = await mongoose.startSession();
   sess.startTransaction();
   await createdPlace.save({session:sess});
   user.places.push(createdPlace);
   await user.save({session:sess});
   await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("create place failed,try again", 500);
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};
//====================================================

const updatePlace = async (req, res, next) => {
  //hanlding validaion
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("invaild inputs", 422));
  }


  const { title, description } = req.body;
  const placeId = req.params.pid;

 let place;
 try{
   place = await Place.findById(placeId);
 } catch(err){
   const error= new HttpError('could not update place',500);
   return next(error);
 }

 //DISALLOW USER TO CHANGE THE PLACE OF OTHER USER 
 console.log(place.creator)
 if(place.creator.toString() !== req.userData.userId){
   return next(new Error('You are not allowed to edit the place',401))
 }

  place.title = title;
  place.description = description;

  try{
    await place.save();
  } catch(err){
    const error = new HttpError('could not update place',500);
    return next(error);
  }

  res.status(200).json({ place: place.toObject({getters:true}) });
};


//====================================================
// const deletePlace = async (req, res, next) => {
//   const placeId = req.params.pid;
  

//   let place;
//   try{
//   place = (await Place.findById(placeId)).populate('creator');
//   console.log(place);
//   } catch(err){
//     const error= new HttpError('could not delete place',500);
//     return next(error);
//   }

//   if(!place){
//     const error = new HttpError('could not find place to be deleted',404);
//     return next(error);
//   }
 
  

//   try{

//     const sess = await mongoose.startSession();
 
//     sess.startTransaction();
//     await place.remove({session:sess});
//     place.creator.places.lodash.pull(place);
//     await place.creator.save({session:sess});
//     await sess.commitTransaction();
   
//   } catch(err){
//     console.log(err);
    
//     const error= new HttpError('could not delete place,something went wrong',500);
//     return next(error);
//   }
  
//   res.status(200).json({ message: "deleted place." });
// };
//====================================================

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place.',
      500
    );
    return next(error);
  }

  
  
  if (!place) {
    const error = new HttpError('Could not find place for this id.', 404);
    return next(error);
  }
  
  console.log(place);
  
  if(place.creator.id !== req.userData.userId){
    return next(new HttpError('Not allowed to delete this place',401));
  }

  const imagePath = place.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place.',
      500
    );
    return next(error);
  }

  fs.unlink(imagePath,err=>{
    console.log(err);
  })
  
  res.status(200).json({ message: 'Deleted place.' });
};


exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
