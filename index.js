const express = require('express')
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const port = 5000
const cors = require('cors');


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