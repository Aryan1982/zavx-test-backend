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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
