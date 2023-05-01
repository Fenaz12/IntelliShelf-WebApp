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

// Custom

// const dataSchema = new mongoose.Schema({
//   _id: {
//     type: String,
//     required: true,
//     default: () => new mongoose.Types.ObjectId().toString()
//   },
//   item: String,
//   stock: Number,
//   email: String,
// });

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



// Define model for the collection
app.get('/api/data', (req, res) => {
    Data.find()
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Server error');
        });
});

// Login User

app.post('/api/login', async(req,res)=>{
  const user = await User.findOne({
    email : req.body.email,
    password: req.body.password,
  })

  if(user){

    return res.json({email: user.email,  user: generateToken(req.body.email)})
  }else{
    return res.json({status:'Incorrect Email or Password', user:false})
  }
})

// Save Data 

app.post('/api/data', (req, res) => {
  const { item, stock, email } = req.body;
  const newData = new Data({ item, stock, email });
  newData.save()
    .then((data) => {
      res.json(data);
      console.log(`New data saved with id: ${data._id}`);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Server error');
    });
});


// Get min max details

app.get('/api/user-data/:email', async (req, res) => {
  const email = req.params.email;
  
  try {
    const userData = await MinMaxData.findOne({ email });
    res.send(userData.store_limitations);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

// Update data
app.put('/api/data/:email/:name', (req, res) => {
  const { stock } = req.body;
  const { email, name } = req.params;
  // Find the data by email and name
  Data.findOne({ email: email, item: name })
    .then((data) => {
      if (!data) {
        return res.json("Did not update");
      }
      // Update the fields that are present in the request body
      data.stock = stock;
      // Save the updated data
      data.save()
        .then((updatedData) => {
          res.json(updatedData);
          console.log(`Updated email: ${email}, name: ${name}, stock: ${stock}`)
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send('Server error');
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Server error');
    });
});

// Update stock of an item
app.put('/api/data/:email', (req, res) => {
  const { items } = req.body;
  const { email } = req.params;
  // Find the data by email
  Prediction.findOne({ email: email })
    .then((data) => {
      if (!data) {
        return res.json("Did not update");
      }
      // Update the items array
      data.predictions = items;
      //console.log(data.items)
      // Save the updated data
      data.save()
        .then((updatedData) => {
          res.json(updatedData);
          console.log(`Updated email: ${email}, items: ${JSON.stringify(items)}`)
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send('Server error');
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Server error');
    });
});

// End Custom

const PORT = process.env.PORT || 8080;

app.listen(PORT, console.log(`Server Started ${PORT}`));
