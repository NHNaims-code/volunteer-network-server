const express = require('express')
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const admin = require('firebase-admin');

const port = 5000
const cors = require('cors');



const serviceAccount = require("./configs/vollunteer-network-firebase-adminsdk-o0o69-0db595042b.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://vollunteer-network.firebaseio.com"
});


const app = express()
app.use(bodyParser.json())
app.use(cors())

app.get('/', (req, res) => {
  res.send('Hello World!')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sjmet.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true});
client.connect(err => {
  const eventCollection = client.db("vollunteer-network").collection("events");
  const registerCollection = client.db("vollunteer-network").collection("registers");
  eventCollection.createIndex( { title: "text" } )
  
    app.post('/addevent', (req, res) => {
        const event = req.body;
        // idToken comes from the client app
        const bearer = req.headers.authorization;
        if(bearer && bearer.startsWith('Bearer ')){
            const idToken = bearer.split(' ')[1];
            console.log({ idToken });
  
          // idToken comes from the client app
          admin.auth().verifyIdToken(idToken)
          .then(function(decodedToken) {
            let uid = decodedToken.uid;

             eventCollection.insertOne(event)
            .then(result => {
                res.send(result.insertedCount > 0)
            })

            console.log({uid});
          }).catch(function(error) {
            res.status(401).send('un-authorized');
            // Handle error
          });
            // idToken comes from the client app
   
        }
        else{
          res.status(401).send('un-authorized')
        }
    })

    app.get('/events', (req, res) => {
        eventCollection.find({}).toArray((err, documents) => {
            res.send(documents);
        })
    })


    app.post('/register', (req, res) => {
        const registerData = req.body;
        registerCollection.insertOne(registerData)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    })

    app.get('/user/:email', (req, res) => {

        const bearer = req.headers.authorization;
        if(bearer && bearer.startsWith('Bearer ')){
            const idToken = bearer.split(' ')[1];

          // idToken comes from the client app
          admin.auth().verifyIdToken(idToken)
          .then(function(decodedToken) {
            let uid = decodedToken.uid;
            if(uid.email === req.params.email){
                registerCollection.find({email: req.params.email})
                .toArray((err, documents) => {
                    res.send(documents)
                })
            }

            console.log({uid});
          }).catch(function(error) {
            res.status(401).send('un-authorized');
            // Handle error
          });
            // idToken comes from the client app
   
        }
        else{
          res.status(401).send('un-authorized')
        }
    })

    
    app.get('/users', (req, res) => {

        const bearer = req.headers.authorization;
        if(bearer && bearer.startsWith('Bearer ')){
            const idToken = bearer.split(' ')[1];
  
          // idToken comes from the client app
          admin.auth().verifyIdToken(idToken)
          .then(function(decodedToken) {
            let uid = decodedToken.uid;

            registerCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })

            console.log({uid});
          }).catch(function(error) {
            res.status(401).send('un-authorized');
            // Handle error
          });
            // idToken comes from the client app
   
        }
        else{
          res.status(401).send('un-authorized')
        }
        
    })

    app.get('/profileEvent/:title', (req, res) => {
        eventCollection.find({title: req.params.title})
        .toArray((err, documents)=>{
            res.send(documents)
        })
    })

    app.delete('/cancle/:id',(req, res) => {
        console.log(req.params.id);
        registerCollection.deleteOne({_id:ObjectId(req.params.id)})
        .then(result => {
            res.send(result.deletedCount > 0);
        })
    })

    app.delete('/delete/:email', (req, res) => {
        registerCollection.deleteMany({email:req.params.email})
        .then(result => {
            res.send(result.deletedCount > 0)
        })
    })

    app.get('/search', (req, res) => {
        eventCollection.find({ $text: { $search: req.query.search } }).toArray((err, documents) => {
            res.send(documents);
        })
    })

});


app.listen(port);