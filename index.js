const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken

const app = express();
const port = 8000;
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const users = [
  { id: 1, username: 'user1', password: 'password1' },
  { id: 2, username: 'user2', password: 'password2' }
];

const secretKey = 'thisismysecretkey';

const clientId = 'thisismyclientid';

const authorizationCodes = {};

// Login route
app.post('/login', (req, res) => {
  // console.log(req.query)
  const { username, password } = req.body;
  const { client_id, redirect_uri:reqRedirectUri,state:reqState } = req.query;

  const user = users.find(user => user.username === username);

  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  // const token = jwt.sign({ userId: user.id, clientId: client_id }, secretKey, { expiresIn: '1h' });
  
  const authorizationCode = Math.random().toString(36).substring(7); // Generate random authorization code
  authorizationCodes[authorizationCode] = { client_id, reqRedirectUri };
  if(user){
    res.status(200).json({redirect:`${reqRedirectUri}?code=${authorizationCode}&state=${reqState}`});
  }
});

// Token refresh route
app.post('/refresh-token', (req, res) => {
  const userid = 1


  const accessToken = jwt.sign({ userId:userid }, secretKey, { expiresIn: '2h' });

  res.json({token:accessToken})
  // const refreshToken = req.body.refreshToken;
  
  // if (!refreshToken) {
  //   return res.status(400).json({ message: 'Refresh token is required' });
  // }

  // try {
  //   const decoded = jwt.verify(refreshToken, secretKey);

  //   if (decoded.exp < Date.now() / 1000) {
  //     return res.status(401).json({ message: 'Refresh token has expired' });
  //   }

  //   const accessToken = jwt.sign({ userId: decoded.userId, clientId: clientId }, secretKey, { expiresIn: '2h' });

  //   res.json({ accessToken });
  // } catch (error) {
  //   return res.status(401).json({ message: 'Invalid refresh token' });
  // }
});

app.post('/decodeToken', (req,res)=>{
 const { token } = req.body;

  console.log(token);
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.error('Error decoding token:', err);
      return res.status(400).json({ error: 'Invalid token' });
    }
    console.log('Decoded token:', decoded);
    res.json(decoded);
  });
})

app.post('/auth/o2/token', (req, res) => {
  console.log("auth api called")
  const { grant_type, code, client_id, redirect_uri } = req.body;
  console.log(req.query)
  console.log(req.body)
  console.log(req.params)
  if (!grant_type || !code || !client_id || !redirect_uri) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  if (grant_type !== 'authorization_code') {
    return res.status(400).json({ message: 'Invalid grant_type' });
  }

  if (client_id !== clientId) {
    return res.status(401).json({ message: 'Invalid client credentials' });
  }

  const accessToken = jwt.sign({ clientId: client_id }, secretKey, { expiresIn: '2h' });
  // res.json({ access_token: accessToken });
  res.json({
    access_token:accessToken,
    token_type:"bearer",
    expires_in:7200,
 });
});

app.post('/test', (req,res)=>{
  console.log(req.body);
  res.json({"message":"success"});
})

function replaceTrueWithPythonTrue(obj) {
  // Check if the current object is an array
  if (Array.isArray(obj)) {
      // If it's an array, iterate over its elements
      return obj.map(element => replaceTrueWithPythonTrue(element));
  }
  // If it's an object, iterate over its keys and values
  else if (typeof obj === 'object' && obj !== null) {
      return Object.fromEntries(
          Object.entries(obj).map(([key, value]) => {
              // Recursively call the function for nested objects
              return [key, replaceTrueWithPythonTrue(value)];
          })
      );
  }
  // If it's a boolean value and is true, replace it with "True"
  else if (obj === true) {
      return "True";
  }
  // Otherwise, return the original value
  return obj;
}


app.post('/getUserAppliances',(req,res)=>{

  const SAMPLE_APPLIANCES = [
    {
        "applianceId": "endpoint-001-56",
        "manufacturerName": "AnnantaLabs",
        "modelName": "Smart Switch",
        "friendlyName": "Switch Zavx",
        "friendlyDescription": "Switch that can only be turned on/off",
        "isReachable": true,
        "actions": [
            "turnOn",
            "turnOff"
        ],
        "additionalApplianceDetails": {}
    },
    {
        "applianceId": "endpoint-002-56",
        "manufacturerName": "AnnantaLabs",
        "modelName": "Smart Light ",
        "friendlyName": "Light Zavx",
        "friendlyDescription": "002 Light that is dimmable and can change color and color temperature",
        "isReachable": true,
        "actions": [
            "turnOn",
            "turnOff",
            "setPercentage",
            "incrementPercentage",
            "decrementPercentage",
            "setColor",
            "setColorTemperature",
            "incrementColorTemperature",
            "decrementColorTemperature"
        ],
        "additionalApplianceDetails": {}
    },
    {
        "applianceId": "endpoint-003",
        "manufacturerName": "Sample Manufacturer",
        "modelName": "Smart White Light",
        "friendlyName": "White Light Zavx",
        "friendlyDescription": "003 Light that is dimmable and can change color temperature only",
        "isReachable": true,
        "actions": [
            "turnOn",
            "turnOff",
            "setPercentage",
            "incrementPercentage",
            "decrementPercentage",
            "setColorTemperature",
            "incrementColorTemperature",
            "decrementColorTemperature"
        ],
        "additionalApplianceDetails": {}
    }
];

const modifiedData = replaceTrueWithPythonTrue(SAMPLE_APPLIANCES);
    res.json({"SAMPLE_APPLIANCES":modifiedData})
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
