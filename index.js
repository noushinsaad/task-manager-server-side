const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
    origin: ['http://localhost:5173', 'https://task-manager-bd1a7.web.app'],
    credentials: true,
}));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gmmth.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});



async function run() {
    try {
        const userCollection = client.db("taskManagerDb").collection("users");
        const taskCollection = client.db("taskManagerDb").collection("tasks");
        const activityLogCollection = client.db("taskManagerDb").collection("activityLogs");

        // JWT API
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.send({ token });
        });

        // Token Verification Middleware
        const verifyToken = (req, res, next) => {
            const authHeader = req.headers.authorization;
            if (!authHeader) return res.status(401).send({ message: "Unauthorized Access" });

            const token = authHeader.split(' ')[1];
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
                if (error) {
                    return res.status(401).send({ message: "Unauthorized Access" });
                }
                req.decoded = decoded;
                next();
            });
        };

        // User API
        app.post('/users', async (req, res) => {
            const user = req.body;
            const existingUser = await userCollection.findOne({ email: user.email });
            if (existingUser) return res.send({ message: "User already exists", insertedId: null });

            const result = await userCollection.insertOne(user);
            res.send(result);
        });

        // Task APIs

        // Create Task
        app.post('/tasks', verifyToken, async (req, res) => {
            const task = { ...req.body, createdAt: new Date() };
            const result = await taskCollection.insertOne(task);

            await activityLogCollection.insertOne({
                taskId: task._id,
                message: `${task.title} added to ${task.status}`,
                createdBy: task.createdBy,
                updatedAt: new Date()
            });


            res.send(result);
        });


        // Get All Tasks
        app.get('/tasks/:email', verifyToken, async (req, res) => {
            const email = req.params.email;
            if (email !== req.decoded.email) {
                return res.status(403).send({ message: "Forbidden access" });
            }
            const filter = { createdBy: email };
            const tasks = await taskCollection.find(filter).sort({ status: 1, order: 1 }).toArray();
            res.send(tasks);
        });

        // Update Task
        app.patch('/tasks/:id', verifyToken, async (req, res) => {
            const taskId = new ObjectId(req.params.id);
            const updatedData = req.body;

            let message = ''

            const task = await taskCollection.findOne({ _id: taskId });

            if (updatedData.status === undefined || task.status === updatedData.status) {
                message = `${task.title} is updated `;
            }
            else {
                message = `${task.title} moved to ${updatedData.status.charAt(0).toUpperCase() + updatedData.status.slice(1)}`;
            }

            await activityLogCollection.insertOne({
                taskId: task._id,
                message,
                createdBy: req.decoded.email,
                updatedAt: new Date()
            });

            const result = await taskCollection.updateOne({ _id: taskId }, { $set: updatedData });
            res.send(result);
        });

        // Delete Task
        app.delete('/tasks/:id', verifyToken, async (req, res) => {
            const taskId = new ObjectId(req.params.id);
            const query = { _id: taskId };

            const task = await taskCollection.findOne(query);
            const result = await taskCollection.deleteOne(query);

            await activityLogCollection.insertOne({
                taskId: task._id,
                message: `${task.title} is deleted`,
                createdBy: task.createdBy,
                updatedAt: new Date()
            });

            res.send(result);
        });

        // activity logs APIs
        app.get('/activityLogs/:email', verifyToken, async (req, res) => {
            const email = req.params.email;
            if (email !== req.decoded.email) {
                return res.status(403).send({ message: "Forbidden access" });
            }
            const filter = { createdBy: email };
            const activityLogs = await activityLogCollection.find(filter).toArray();
            res.send(activityLogs);
        })

        // console.log("Connected to MongoDB!");

    } catch (error) {
        console.error(" Error connecting to MongoDB:", error);
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Task Manager API with Activity Logs is running");
});

app.listen(port, () => {
    // console.log(`Server running on port ${port}`);
});
