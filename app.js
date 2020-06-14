const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const userRoutes = require("./routes/user-routes");
const placesRoutes = require("./routes/places-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

app.use((req,res,next) => {
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Headers','Origin,X-Requested-With,Content-Type,Accept,Authorization');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,PATCH,DELETE');
  next();
})
app.use("/api/places", placesRoutes); // => /api/places //path is not exact
app.use("/api/users", userRoutes);

//error handling for invalid routes
app.use((req, res, next) => {
  const error = new HttpError("could not find this route", 404);
  throw error;
});

//error handling middleware function
app.use((error, req, res, next) => {
  if (res.headerSent) return next(error);

  res.status(error.code || 500);
  res.json({ message: error.message || "an unknown error occured!" });
});

mongoose.connect('mongodb+srv://kushagra_13:RgI3zlVMR8sAQEI1@cluster0-w2lg8.mongodb.net/mern?retryWrites=true&w=majority').then(()=>{
    app.listen(5000, () => {
        console.log("server started");
      });
}).catch((err)=>{
    console.log(err);
    
});


