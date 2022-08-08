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

//   console.log(uri)
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

        //Cover Letter Database Start
        const coverLetterCollection = client.db("resume_builder").collection("coverLetter");
        //Cover Letter Database End


        //Cover Letter  Part Start
        app.post('/aboutForm', async (req, res) => {
            const NewAboutForm = req.body;
            const result = await coverLetterCollection.insertOne(NewAboutForm);
            // console.log(result);
            res.send(result);

        })

        app.get('/aboutForm', async (req, res) => {
            const query = {};
            const cursur = coverLetterCollection.find(query);
            const service = await cursur.toArray();
            res.send(service);
        })
        //Cover Letter Part End

        // CV DATABASE
        const cvPhotoCollection = client.db("cv_template").collection("cv_images");
        const cvInfoCollection = client.db("cv_template").collection("cvInfo");
        //GET CV photo
        app.get('/cvPhoto', async (req, res) => {
            const query = {};
            const cursor = cvPhotoCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
        //POST data from cv
        app.post('/cvInfo', async (req, res) => {
            const info = req.body;
            const result = await cvInfoCollection.insertOne(info);
            res.send(result);
        })




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

