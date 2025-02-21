const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'https://task-manager-bd1a7.web.app'],
        credentials: true,
    },
});

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

        app.options('*', cors());


        // JWT API
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

            res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
            res.setHeader("Access-Control-Allow-Credentials", "true");

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

        // WebSocket Setup
        io.on('connection', (socket) => {
            console.log(`Client connected: ${socket.id}`);

            socket.on('disconnect', () => {
                console.log(`Client disconnected: ${socket.id}`);
            });
        });

        // Emit updated task list to all clients
        const emitTasks = async () => {
            const tasks = await taskCollection.find().sort({ createdAt: -1 }).toArray();
            io.emit('tasksUpdated', tasks);
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
            emitTasks();
            res.send(result);
        });

        // Get All Tasks
        app.get('/tasks/:email', verifyToken, async (req, res) => {
            const email = req.params.email;

            if (email !== req.decoded.email) {
                return res.status(403).send({ message: "forbidden access" })
            }
            const filter = { createdBy: email }
            const tasks = await taskCollection
                .find(filter)
                .sort({ status: 1, order: 1 })
                .toArray();
            res.send(tasks);
        });


        // Update Task
        app.patch('/tasks/:id', verifyToken, async (req, res) => {
            const result = await taskCollection.updateOne(
                { _id: new ObjectId(req.params.id) },
                { $set: req.body }
            );
            emitTasks();
            res.send(result);
        });

        // Delete Task
        app.delete('/tasks/:id', verifyToken, async (req, res) => {
            const result = await taskCollection.deleteOne({ _id: new ObjectId(req.params.id) });
            emitTasks();
            res.send(result);
        });

        await client.db("admin").command({ ping: 1 });
        console.log("Connected to MongoDB!");

    } catch (error) {
        console.error(" Error connecting to MongoDB:", error);
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Task Manager API with WebSockets is running");
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
