const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const mongoose = require("mongoose");
const cors = require('cors');
const bodyParser = require('body-parser');
const generateToken = require("./utils/generateToken")
const path = require("path")
const app = express();

app.use(express.static(path.join(__dirname +"/public")));
app.use(cors());
app.use(bodyParser.json());
dotenv.config();
connectDB();

app.get('/',  (req,res)=>{
    res.send("API is running.")
});


const dataSchema = new mongoose.Schema({
  item: String,
  stock: Number,
  email: String,
});


const User_schema = new mongoose.Schema({
    email: {type:String, required:true},
    password: {type:String, required:true},
  },
)

const minmax_dataschema = new mongoose.Schema({
  email: String,
  password: String,
  store_limitations: Array,
});

const predictionSchema = new mongoose.Schema({
  email: { type: String, required: true },
  predictions: [{
    item: { type: String },
    stock: { type: Number}
  }]
});

// Create a Mongoose model for the data
const MinMaxData = mongoose.model('UserData', minmax_dataschema, "intelli");
const Data = mongoose.model('Data', dataSchema, "predictions_v2");
const User = mongoose.model('User', User_schema, "intelli");
const Prediction = mongoose.model('Prediction', predictionSchema, "predictions_v2");



const PORT = process.env.PORT || 8080;

app.listen(PORT, console.log(`Server Started ${PORT}`));
