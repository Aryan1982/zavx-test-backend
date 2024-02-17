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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
