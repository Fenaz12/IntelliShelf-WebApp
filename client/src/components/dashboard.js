import React, { useState, useEffect,useRef} from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import "./dashboard.css"
import PropTypes from 'prop-types';
import LinearProgress from '@mui/material/LinearProgress';
import { styled } from '@mui/system';
import PrimarySearchAppBar from './navbar'
import { useNavigate } from "react-router-dom";
import Alert from '@mui/material/Alert';

const LowStock = styled('div')({
  color: 'darkslategray',
  backgroundColor: 'aliceblue',
  padding: 8,
  borderRadius: 4,
});


function LinearProgressWithLabel(props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}
 
export default function Dashboard() {
  const [items, setItems] = useState([{id: 1, name: "Apple", stock:0, min:0, max:0, avg:0, image: "./images/apple.png"},
              {id: 2, name: "Banana", stock:0, min:0, max:0, avg:0, image: "./images/bananas.png"},
              {id: 3, name: "Bread", stock:0, min:0, max:0, avg:0, image: "./images/breads.png"},
              {id: 4, name: "Carrot", stock:0, min:0, max:0, avg:0, image: "./images/carrot.png"},
              {id: 5, name: "Tomato", stock:0, min:0, max:0, avg:0, image: "./images/tomato.png"},
              {id: 6, name: "Potato", stock:0, min:0, max:0, avg:0, image: "./images/potatoe.png"},
              {id: 7, name: "Orange", stock:0, min:0, max:0, avg:0, image: "./images/orange.png"}]);
 
  const [query, setQuery] = useState("");
  const [progress, setProgress] =useState(10);
  const [widthContainer, setWidthContainer] = useState();
  const [email, setEmail] = useState();
  const [error, setError] = useState();
  const [totalcount, setTotalcount] = useState(0);
  const [number, setNumber] = useState(0);
  const history = useNavigate();


  // Check if user is logged in or redirect to login page
  useEffect(()=>{
    const userInfo = localStorage.getItem("userInfo");
    if(!userInfo){
        history("/login")
    }else{
      setEmail(JSON.parse(userInfo).email)
    }
  },[history])


  // Get Min Max Avg Details and update the items array
  useEffect(()=>{
    const fetchData = async() =>{
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const email = userInfo.email;
      const result = await axios(`/api/user-data/${email}`);
      
      for (const key in result.data) {
        if (result.data.hasOwnProperty(key)) {
          //console.log(result.data[key].min)
          handleUpdateMinMax(result.data[key].item, result.data[key].min,result.data[key].max, result.data[key].average);
        }
      }
    }
    fetchData(); 
  },[])


  // Function to update stock in items array
  const handleUpdateItem = (name, newStock) => {
    setItems((prevItems) => {
      // Find the index of the item to update
      const index = prevItems.findIndex((item) => item.name === name);
      const newItems = [...prevItems];
      newItems[index] = { ...prevItems[index], stock: newStock };
      
      return newItems;
    });
  };

  // Function to update min max avg in items array
  const handleUpdateMinMax = (name, newmin, newmax, newavg) => {
    setItems((prevItems) => {
      // Find the index of the item to update
      const index = prevItems.findIndex((item) => item.name === name);
      const newItems = [...prevItems];
      newItems[index] = {
        ...prevItems[index],
        min: newmin,
        max: newmax,
        avg: newavg,
      };
      return newItems;
    });
  };
  const elementRef = useRef(null);


// Setting width of search bar
  useEffect(() => {
    if (elementRef.current) {
      setWidthContainer((elementRef.current.offsetWidth)-15);
    }
  }, []);
  const [predictions, setPredictions] = useState({});


// Get predictions from python server
useEffect(() => {
  const fetchData = async () => {
    const result = await axios.post('http://127.0.0.1:5000/api/process_image');
    
    if(JSON.parse(localStorage.getItem("userInfo")).email === result.data.email){
      setError(false)
      setPredictions(result.data.predictions);
      //console.log(result.data.predictions)
  
      for (const key in result.data.predictions) {
        if (result.data.predictions.hasOwnProperty(key)) {
          const value = result.data.predictions[key];
          handleUpdateItem(key, value);
        }
      }
    }else{
      console.log("Email Does not Match")
      setError(true)
    }
    }
    //console.log(items)

  
  fetchData(); // Call the function for the first time
  
  const interval = setInterval(() => {
    fetchData();
  }, 60000); 

  return () => clearInterval(interval);
}, []);

// Send predictions to nodejs
useEffect(() => {
  const updateData = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const email = userInfo.email;
    const updatedItems = items.map(item => ({ item: item.name, stock: item.stock }));
    try {
      const response = await axios.put(`/api/data/${email}`, {
        email: email,
        items: updatedItems,
      });
      console.log(response.data)
    } catch (error) {
      console.log(error);
    }
  };
  
  updateData();
}, [items]);

// Send predictions to nodejs
// useEffect(() => {
//   const updateData = async () => {
//     const userInfo = JSON.parse(localStorage.getItem("userInfo"));
//     const email = userInfo.email;
//     for (const item of items){
//       try{
//         const response = await axios.put(`http://127.0.0.1:8080/api/data/${email}/${item.name}`,{
//           email: email,
//           stock: item.stock,
//         });
//         //console.log(email)
//       }
//       catch(error){
//         console.log(error);
//       }
//     }
//   };
  
//   updateData();
// }, [items]);

// Finding Stock sum
useEffect(()=>{
  const stockSum = items.reduce((total, item) => total + item.stock, 0);
  setTotalcount(stockSum)
},[items])


  LinearProgressWithLabel.propTypes = {
    value: PropTypes.number.isRequired,
  };
 
  return (
    <div>
      <PrimarySearchAppBar/>

      {error? <Alert severity="error">Make sure that you have logged into this account on your mobile device</Alert>: null}
      <Container maxWidth="false"  sx={{
        p:0,
      }}>
        <Grid container spacing={4}>
          <Grid item xs={8}>
          <div style={{}}>
          <input style={{backgroundColor:"#161c34", height: "39px",width: `${widthContainer}px`,margin: "30px",marginLeft: "10px",display: "block",borderRadius:1, border:"none",padding:"6px", color:'white', fontSize:"18px"}}type="text" placeholder="Search..." onChange={(e) => setQuery(e.target.value)}/>
          </div>
          <Box ref={elementRef} className="itemList" sx={{maxHeight: '78vh', boxShadow:2, overflowY: "auto", display: "flex", flexGrow: 1, flexDirection: "column", paddingTop:'10px', backgroundColor:"#161c34",margin: "30px",marginLeft: "10px", paddingRight: "40px", paddingBottom: '10px'}}>
            {items.filter((item)=>
              item.name.toLowerCase().includes(query.toLowerCase())).map((item) =>
            (
              <ul className='listItem'>
                      <Grid container  sx={{boxShadow:2, borderRadius:1, padding:'10px', background:"#2C3E50",marginBottom:'-15px'}}>
                        <Grid item xs={2} >
                          <Box sx={{boxShadow: '1', borderRadius:1, height:'50px', width:'60px', padding:2}}>
                            <img  src={require(`${item.image}`)} width="55px" height="55px" />
                          </Box>
                        </Grid>
                        <Grid item xs={1}>
                          <Box sx={{height:'60px',marginLeft:'-40px', position:'relative', color:'white'}}><Typography sx={{textAlign:'left', position:'absolute', bottom:0}}>{item.name}</Typography></Box>
                        </Grid>
                        <Grid item xs={5}>
                          <Box sx={{ height:'60px',textAlign:'center', position:'relative'}}><Typography sx={{textAlign:'center', position:'absolute', bottom:0, left:'50%',  color:'white'}}>{item.stock}</Typography></Box>
                        </Grid>
                        <Grid item xs={4}>
                        <Box sx={{height:'60px',textAlign:'center', position:'relative'}}>
                        {item.stock > item.min ? (
                          item.stock > item.avg ? (
                            <Typography sx={{textAlign:'right', position:'absolute', bottom:0, left:'70%', color:'white'}}>High Stock</Typography>
                            ) : (
                              <Typography sx={{textAlign:'right', position:'absolute', bottom:0, left:'70%', color:'white'}}>Medium Stock</Typography>
                              )
                        ) : (
                          <Typography sx={{textAlign:'right', position:'absolute', bottom:0, left:'70%', color:'white'}}>Low Stock</Typography>
                          )}
                        </Box>
                        </Grid>
                      </Grid>
              </ul>
            ))}
 
          </Box>
          </Grid>

          <Grid item xs={4}>
            <Grid container> 
              <Grid item xs={12}> 
              <Box sx={{ borderRadius:1, backgroundColor:"#161c34", margin:'30px',padding:1,marginTop:"30px", position:'relative'}}>
              <Typography variant="h6" sx={{color:'white'}}> Products on low stock</Typography>
              <List>
                {items.map((item) => (
                  item.stock <= item.min && (
                    <Box
                    sx={{

                      bgcolor: '#161c34',
                      borderRadius: 1,
                      margin: "10px 30px 5px 10px"
                    }}
                  >
                    <Typography sx={{textAlign: "left",marginLeft: "15px",marginBottom:"-5px", color:'white'}}>{item.name}</Typography>
                    <ListItem key={item.id}>
                      <Box sx={{ width: '100%'}}>
                        <LinearProgressWithLabel sx={{color:'white'}}value={(item.stock / item.max) * 100} />
                      </Box>
                    </ListItem>
                  </Box>
                  )
                ))}
              </List>
              </Box>
              </Grid>
              <Grid item xs={12}>
                <Box  sx={{ position:'relative',borderRadius:1, backgroundColor:"#161c34", margin:'30px',padding:1,marginTop:"0px", minHeight:'24vh'}} >
                    <Typography variant="h4" sx={{color:"white", textAlign:'center',marginTop:"10px"}}>Inventory count</Typography> <br/><br/>
                    <Typography variant="h1" sx={{color:"#A7CAED", textAlign:'center',marginTop:"-10px"}}>{totalcount}</Typography>

                </Box></Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
      </div>
  );
}