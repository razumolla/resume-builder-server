const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000

// Middleware on
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n68kq.mongodb.net/?retryWrites=true&w=majority`;

//   console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        console.log("Database Connected 2");
        const serviceCollection = client.db("resume_builder").collection("services");
        const cvResumeBlogCollection = client.db("carrier_blogs").collection("cvResumeBlog");
        const coverLetterBlogCollection = client.db("carrier_blogs").collection("coverLetterBlog");
        const personalDevBlogCollection = client.db("carrier_blogs").collection("personalDevBlog");
        const inspiringBlogCollection = client.db("carrier_blogs").collection("inspiringBlog");
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

        // blog add section start
        app.post('/cvResumeBlog', async (req, res) => {
            const resumeBlog = req.body;
            const result = await cvResumeBlogCollection.insertOne(resumeBlog);
            res.send(result);
        })
        app.get('/cvResumeBlog', async (req, res) => {
            const query = {};
            const cursor = cvResumeBlogCollection.find(query);
            const resumes = await cursor.toArray();
            res.send(resumes);
        })

        app.post('/coverLetterBlog', async (req, res) => {
            const coverLetter = req.body;
            const result = await coverLetterBlogCollection.insertOne(coverLetter);
            res.send(result);
        })
        app.get('/coverLetterBlog', async (req, res) => {
            const query = {};
            const cursor = coverLetterBlogCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/personalDevBlog', async (req, res) => {
            const personalDevBlog = req.body;
            const result = await personalDevBlogCollection.insertOne(personalDevBlog);
            res.send(result);
        })
        app.get('/personalDevBlog', async (req, res) => {
            const query = {};
            const cursor = personalDevBlogCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/inspiringBlog', async (req, res) => {
            const inspiringStory = req.body;
            const result = await inspiringBlogCollection.insertOne(inspiringStory);
            res.send(result);
        })
        app.get('/inspiringBlog', async (req, res) => {
            const query = {};
            const cursor = inspiringBlogCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
        // blog add section end




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