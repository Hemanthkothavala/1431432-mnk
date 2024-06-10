const express = require('express');
const app = express();
const port = 3000;
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const path = require('path');
const serviceAccount = require("./key.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/login', (req, res) => {
  res.render("login");
});

app.post('/login', async (req, res) => { 
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.send("Username and password are required");
  }

  try {
    const userRef = db.collection("users")
      .where("username", "==", username)
      .where("password", "==", password);
    const userSnapshot = await userRef.get();

    if (userSnapshot.empty) {
      return res.send("Invalid username or password");
    }

    res.render("main");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error checking user credentials");
  }
});

app.get('/signup', (req, res) => {
  res.render("signup");
});

app.post('/signup', async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  if (!username || !email || !password) {
    return res.send("All fields are required");
  }

  try {
    const usernameRef = db.collection("users").where("username", "==", username);
    const emailRef = db.collection("users").where("email", "==", email);

    const usernameSnapshot = await usernameRef.get();
    const emailSnapshot = await emailRef.get();

    if (!usernameSnapshot.empty) {
      return res.send("Username already in use");
    }

    if (!emailSnapshot.empty) {
      return res.send("Email already in use");
    }

    await db.collection('users').add({
      username: username,
      email: email,
      password: password
    });

    res.render("login");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error signing up");
  }
});

app.listen(port, () => {
  console.log('Example app listening on port ${port}');
});
