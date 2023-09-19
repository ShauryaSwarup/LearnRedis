const { default: axios } = require("axios");
const express = require("express");
const redis = require("redis");
const util = require("util");

// Create Redis Client
const client = redis.createClient();
const connect = async () => {
    await client.connect();
};
connect();
client.on('connect', () => console.log('Redis Client Connected'));
client.on('error', (err) => console.log('Redis Client Connection Error', err));

//Express Server Setup
const app = express();
app.use(express.json());

//Express Routes
app.post('/', async (req, res) => {
    const { key, value } = req.body;
    const response = await client.set(key, value);
    console.log(key, value);
    res.send(response);
});

app.get('/', async (req, res) => {
    const { key } = req.body;
    const cachedResponse = await client.get(key);
    if(cachedResponse){
        return res.send(cachedResponse);
    }
    res.send("No cached response found");
});

app.get('/post/:id', async (req, res) => {
    const { id } = req.params;
    const cachedResponse = await client.get(id);
    if(cachedResponse){
        return res.send(JSON.parse(cachedResponse));
    }
    const response = await axios.get(`https://jsonplaceholder.typicode.com/posts/${id}`);
    client.set(id, JSON.stringify(response.data));
    res.send(response.data);
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
