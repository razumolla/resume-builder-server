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


// jwt middleware
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        res.decoded = decoded;
        next();
    })
}




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
        const clPhotoCollection = client.db("resume_builder").collection("coverLetterTemplate");
        //Cover Letter Database End

        // all users &
        // user collection for jwt
        const userCollection = client.db("resume_builder").collection("users");

        // CV DATABASE
        const cvPhotoCollection = client.db("cv_template").collection("cv_images");
        const cvInfoCollection = client.db("cv_template").collection("cvInfo");

        //MOCK INTERVIEW DATABASE
        const interviewCollection = client.db("mock_interview").collection("interview");
        const appointmentCollection = client.db("mock_interview").collection("appointment");
        // user review 
        const reviewCollection = client.db("userReview").collection("review");



        // user information and jwt

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ result, token });


        })


        app.get("/user", async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);
        });

        app.get("/admin/:email", async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isAdmin = user.role === "admin";
            res.send({ admin: isAdmin });
        });

        app.put("/user/admin/:email", async (req, res) => {
            const email = req.params.email;
            const filter = await userCollection.findOne({ email: email });
            console.log(filter);
            const updateDoc = {
                $set: { role: "admin" },
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        // Delete
        app.delete("/user/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.send(result);
        });


        //Cover Letter  Part Start
        app.post('/aboutForm', async (req, res) => {
            const NewAboutForm = req.body;
            const result = await coverLetterCollection.insertOne(NewAboutForm);
            // console.log(result);
            res.send(result);

        })

        app.get('/coverLetterPhoto', async (req, res) => {
            const query = {};
            const cursor = clPhotoCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/allCLPhoto', async (req, res) => {
            const query = {}
            const cursor = coverLetterCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
        //Cover Letter Part End


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
        //GET INTERVIEW
        app.get('/interview', async (req, res) => {
            const query = {}
            const cursor = interviewCollection.find(query);
            const interview = await cursor.toArray();
            res.send(interview);
        })

        //GET appointment
        app.get('/appointment', async (req, res) => {
            const student = req.query.student;
            const query = { student: student }
            const cursor = appointmentCollection.find(query);
            const appointments = await cursor.toArray();
            res.send(appointments);
        })

        //POST appointment
        app.post('/appointment', async (req, res) => {
            const appointment = req.body;
            const filter = {
                interview: appointment.interview,
                date: appointment.date,
                student: appointment.student
            }
            const exist = await appointmentCollection.findOne(filter);
            if (exist) {
                return res.send({ success: false, appointment: exist });
            }
            const result = await appointmentCollection.insertOne(appointment);
            res.send({ success: true, result });
        })

        //Delete appointment
        app.delete('/appointment/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await appointmentCollection.deleteOne(query);
            res.send(result);
        })

        //GET available interview
        app.get('/available', async (req, res) => {
            const date = req.query.date || 'Aug 23, 2022';

            // get all interviews
            const interviews = await interviewCollection.find().toArray();

            // get the appointment of that day
            const query = { date: date };
            const appointments = await appointmentCollection.find(query).toArray();

            // for each service find booking for that service
            interviews.forEach(interview => {
                const interviewBookings = appointments.filter(appointment => appointment.interview === interview.name);
                const bookedSlots = interviewBookings.map(interview => interview.slot);
                const available = interview.slots.filter(slot => !bookedSlots.includes(slot));
                interview.slots = available;
            })
            res.send(interviews);
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
        // get one data for details page
        app.get('/coverLetterBlog/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await coverLetterBlogCollection.findOne(query);
            res.send(result)
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



        // stripe
        app.post('/create-payment-intent', async (req, res) => {
            const price = req.body;
            const amount = parseInt((price.price)) * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            });
            res.send({ clientSecret: paymentIntent.client_secret })
        })


        // review get 

        app.get("/reviews", async (req, res) => {
            const email = req.query.email;

            const query = { email: email };
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        // reviews add {post}

        app.post("/reviews", async (req, res) => {
            const newUser = req.body;
            console.log("new user", newUser);
            const result = await reviewCollection.insertOne(newUser);
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