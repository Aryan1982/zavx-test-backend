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

  const token = jwt.sign({ userId: user.id, clientId: client_id }, secretKey, { expiresIn: '1h' });
  
  const authorizationCode = Math.random().toString(36).substring(7); // Generate random authorization code
  authorizationCodes[authorizationCode] = { client_id, reqRedirectUri };
  if(user){
    res.status(200).json({redirect:`${reqRedirectUri}?code=${authorizationCode}&state=${reqState}`});
  }
});

// Token refresh route
app.post('/refresh-token', (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, secretKey);

    if (decoded.exp < Date.now() / 1000) {
      return res.status(401).json({ message: 'Refresh token has expired' });
    }

    const accessToken = jwt.sign({ userId: decoded.userId, clientId: clientId }, secretKey, { expiresIn: '2h' });

    res.json({ accessToken });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});


app.post('/auth/o2/token', (req, res) => {
  const { grant_type, code, client_id, client_secret, redirect_uri } = req.body;

  if (!grant_type || !code || !client_id || !client_secret || !redirect_uri) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  if (grant_type !== 'authorization_code') {
    return res.status(400).json({ message: 'Invalid grant_type' });
  }

  if (client_id !== clientId || client_secret !== secretKey) {
    return res.status(401).json({ message: 'Invalid client credentials' });
  }

  const accessToken = jwt.sign({ clientId: client_id }, secretKey, { expiresIn: '1h' });
  res.json({ access_token: accessToken });
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
