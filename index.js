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

const userData = [
  {
      "id": 1,
      "username": "user1",
      "password": "password1",
      "devices": [
          {
              "applianceId": "endpoint-001-56",
              "manufacturerName": "AnnantaLabs",
              "modelName": "Smart Switch user1",
              "friendlyName": "Switch Zavx user1",
              "friendlyDescription": "Switch that can only be turned on/off",
              "actions": [
                  "turnOn",
                  "turnOff"
              ],
              "additionalApplianceDetails": {}
          },
          {
              "applianceId": "endpoint-002-56",
              "manufacturerName": "AnnantaLabs",
              "modelName": "Smart Light user1",
              "friendlyName": "Light Zavx user1",
              "friendlyDescription": "002 Light that is dimmable and can change color and color temperature",
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
          }
      ]
  },
  {
      "id": 2,
      "username": "user2",
      "password": "password2",
      "devices": [
          {
              "applianceId": "endpoint-003",
              "manufacturerName": "Sample Manufacturer",
              "modelName": "Smart White Light user2",
              "friendlyName": "White Light Zavx user2",
              "friendlyDescription": "003 Light that is dimmable and can change color temperature only",
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
      ]
  }
];
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
  
  const authorizationCode = user.id; // Generate random authorization code
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

  const accessToken = jwt.sign({ clientId: client_id, code:code }, secretKey, { expiresIn: '2h' });
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

app.post('/getUserAppliances', (req, res) => {
  console.log('called user appliances');
  const { token } = req.body;
  console.log(req.body);
  // if (!token.startsWith('ey')) {
  //   console.log('waiting for actual token')
  //   return
  // }
  // console.log('token verified')
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.error('Error decoding token:', err);
      return res.status(400).json({ error: 'Invalid token' });
    }
    
    console.log('decoded', decoded);
    // Find user's devices based on the decoded user ID
    const userId = decoded.code;
    const userDevices = userData.find(user => user.id == userId)?.devices;

    if (!userDevices) {
      return res.status(404).json({ error: 'User devices not found' });
    }

    // Send the user's devices as a response
    res.json({ userDevices });
  });
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

