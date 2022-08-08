const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000

// Middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n68kq.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        console.log("Database Connected");
        const serviceCollection = client.db("resume_builder").collection("services");
        const resumeCollection = client.db("resume_builder").collection("resume");



        //post data
        app.post('/resume', async (req, res) => {
            const newResume = req.body;
            // console.log('Added new user:', newResume);
            const result = await resumeCollection.insertOne(newResume);
            res.send(result);
            console.log(result);
            // res.send({ result: 'success ' });
        });


    }
    finally {

    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello From Resume')
})

app.listen(port, () => {
    console.log(`Resume-Builder app listening on port ${port}`)
})

