const express = require('express');
const app = express();
const fs = require('fs');
const pug = require('pug');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const dotenv = require('dotenv').config();


app.use(express.json());
app.use(express.urlencoded());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


const dataJson = fs.readdirSync(`${__dirname}/data`, 'utf-8');

app.get('/', (req, res) => {
  res.status(200).render(`${__dirname}/views/form.pug`);
});

app.post('/addprofile', (req, res) => {
  const profileData = (req.body);

  const { name, bio, github, linkedin, twitter, youtubeChannel } = profileData;
  const githubUsername = (github.split('.com/'))[1];
  let check = true;
  dataJson.forEach(el => {
    if (`${githubUsername}.json` === el) {
      res.status(405).render(`${__dirname}/views/userexists.pug`)
      check = false;
    }
  });

  if (check) {
    fetch(`https://api.github.com/users/${githubUsername}`)
      .then(response => response.json())
      .then(data => {
        console.log(data.type);
        if (data.type == 'User') {
          const profileObject = {
            name: `${name}`,
            bio: `${bio}`,
            avatar: `${github}.png`,
            links: [
              {
                "name": "Follow me on GitHub",
                "url": `${github}`,
                "icon": "github"
              },
              {
                "name": "Follow me on Twitter",
                "url": `${twitter}`,
                "icon": "twitter"
              },
              {
                "name": "Get Connected with me on LinkedIn",
                "url": `${linkedin}`,
                "icon": "linkedin"
              },
              {
                "name": "Subscribe my Youtube Channel",
                "url": `${youtubeChannel}`,
                "icon": "youtube"
              }
            ]
          }
          res.status(201).render(`${__dirname}/views/formsubmit.pug`)
          const jsonString = JSON.stringify(profileObject)
          fs.writeFileSync(`${__dirname}/data/${githubUsername}.json`, jsonString, (err) => {
            console.log('Something went wrong while creating file! Please check again');
          })
        }
        else {
          res.send('Please Enter a valid Github Username');
        }
      });
  }
})

let port = process.env.PORT || 3000;
app.listen(port, (req, res) => {
  console.log(`App is running at ${port}`);
})