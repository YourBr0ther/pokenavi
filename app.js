
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://192.168.0.4:27017/loginDemo', { useNewUrlParser: true, useUnifiedTopology: true });

// Set up EJS as the view engine
app.set('view engine', 'ejs');

// Use body-parser to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: false }));

// Set up session middleware
app.use(session({
  secret: `process.env.MONGODB_SECRET`,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: 'mongodb://192.168.0.4:27017/loginDemo' }),
}));

// Your routes go here

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});


const User = require('./models/User');

// Render login page
app.get('/login', (req, res) => {
  res.render('login');
});

// Handle login form submission
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (user && await bcrypt.compare(password, user.password)) {
    req.session.user = { id: user._id, username: user.username };
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

// Render registration page
app.get('/register', (req, res) => {
  res.render('register');
});

// Handle registration form submission
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });

  await user.save();
  res.redirect('/login');
});

// Render dashboard page
app.get('/dashboard', (req, res) => {
  if (req.session.user) {
    res.render('dashboard', { user: req.session.user });
  } else {
    res.redirect('/login');
  }
});

// Handle logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});
