const express = require('express')
const port = 5000
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express()
app.use(bodyParser.json())
app.use(cors())

app.get('/', (req, res) => {
  res.send('Hello World!')
})


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sjmet.mongodb.net/vollunteer-network>?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true});
client.connect(err => {
  const eventCollection = client.db("vollunteer-network").collection("events");
  const registerCollection = client.db("vollunteer-network").collection("registers");
  
    app.post('/addevent', (req, res) => {
        const event = req.body;
        eventCollection.insertOne(event)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
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
        registerCollection.find({email: req.params.email})
        .toArray((err, documents) => {
            res.send(documents)
        })
        
    })
    app.get('/users', (req, res) => {
        registerCollection.find({})
        .toArray((err, documents) => {
            res.send(documents)
        })
        
    })

    app.get('/profileEvent/:title', (req, res) => {
        eventCollection.find({title: req.params.title})
        .toArray((err, documents)=>{
            res.send(documents)
        })
    })

});


app.listen(process.env.PORT || port)