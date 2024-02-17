const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken

const app = express();
const port = 8000;
app.use(cors());

app.use(bodyParser.json());

const users = [
  { id: 1, username: 'user1', password: 'password1' },
  { id: 2, username: 'user2', password: 'password2' }
];

const secretKey = 'thisismysecretkey';

const clientId = 'thisismyclientid';

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(user => user.username === username);

  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const token = jwt.sign({ userId: user.id, clientId: clientId }, secretKey, { expiresIn: '1h' });

  res.json({ message: 'Login successful', token });
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
  // Extract data from the request body
  const { grant_type, code, client_id, client_secret, redirect_uri } = req.body;

  // Check if required parameters are present
  if (!grant_type || !code || !client_id || !client_secret || !redirect_uri) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  // Check if grant_type is 'authorization_code'
  if (grant_type !== 'authorization_code') {
    return res.status(400).json({ message: 'Invalid grant_type' });
  }

  // Check if client_id and client_secret match the expected values
  if (client_id !== clientId || client_secret !== secretKey) {
    return res.status(401).json({ message: 'Invalid client credentials' });
  }

  // If all checks pass, generate and return an access token
  const accessToken = jwt.sign({ clientId: client_id }, secretKey, { expiresIn: '1h' });
  res.json({ access_token: accessToken });
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
