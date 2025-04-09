const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const path = require("path");
const fs = require("fs");
const { ObjectId } = require('mongodb'); // import ObjectId to handle MongoDB object IDs

const app = express();

app.use(express.json());

// logger middleware
app.use((req, res, next) => {
    console.log("Request IP: " + req.url);
    console.log("Request Date: " + new Date());
    next();
});

// CORS headers to allow cross-origin requests 
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");  
    next();  
});

// connect to the MongoDB database
let db;
MongoClient.connect('mongodb+srv://aditi:aditi@cluster0.v1bf1.mongodb.net/AfterSchoolClasses?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if (err) return console.log(err);
    db = client.db('AfterSchoolClasses');
    console.log("Connected to MongoDB");
});

// display a message for root path to show that API is working
app.get('/', (req, res) => {
    res.send('Select a collection, e.g., /collection/messages');
});

// get the collection name
app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);
    return next();
});

// retrieve all the objects from a collection
app.get('/collection/:collectionName', (req, res) => {
    req.collection.find({}).toArray((e, result) => {
        if (e) return next(e);
        res.send(result);
    });
});

// retrieve a single object by ID from a collection
app.get('/collection/:collectionName/:id', (req, res) => {
    const id = req.params.id;
    req.collection.findOne({ _id: new ObjectId(id) }, (e, result) => {
        if (e) return next(e);
        res.send(result);
    });
});

// post data to the collection
app.post('/collection/:collectionName', (req, res) => {
    req.collection.insert(req.body, (e, results) => {
        if (e) return next(e);
        res.send(results.ops);
    });
});

// update data in the collection
app.put('/collection/:collectionName', (req, res, next) => {
    const updatedClasses = req.body;
    // update the 'availableInventory'
    updatedClasses.forEach(classData => {
        req.collection.updateOne(
            { id: classData.id },
            { $set: { availableInventory: classData.availableInventory } },
            { safe: true },
            (e, result) => {
                if (e) return next(e);
            }
        );
    });
    res.send({ msg: 'Availability updated successfully' });
});

// search data in the collection
app.post('/collection/:collectionName/search', (req, res, next) => {
    // Get the search query from the request body
    const searchQuery = req.body.search;  

    if (!searchQuery) {
        return res.status(400).json({ msg: "Search query is required" });
    }

    // Case-insensitive regex
    const searchRegex = new RegExp(searchQuery, 'i');  

    // query to search across multiple fields
    const query = {
        $or: [
            { title: { $regex: searchRegex } },
            { description: { $regex: searchRegex } },
            { location: { $regex: searchRegex } },
            { price: parseFloat(searchQuery) },
            { availableInventory: parseInt(searchQuery) }
        ]
    };

    // log the search query
    console.log("Search Query:", query);

    // search the collection with the query
    req.collection.find(query).toArray((err, results) => {
        if (err) return next(err);
        // log the search results
        console.log("Search Results:", results);
        res.json(results);
    });
});

// delete a single object by ID from a collection
app.delete('/collection/:collectionName/:id', (req, res, next) => {
    const id = req.params.id;
    req.collection.deleteOne({ _id: new ObjectId(id) }, (e, result) => {
        if (e) return next(e);
        if (result.deletedCount === 1) {
            // return a user-friendly success message
            res.json({ message: 'Deletion successful' });
        } else {
            // Return a user-friendly failure message
            res.json({ message: 'No document found with that ID' });
        }
    });
});

// static file middleware to serve files from the 'statics' folder
app.use('/statics', express.static(path.join(__dirname, 'statics')));

// error handling middleware for missing static files
app.use('/statics', (req, res, next) => {
    var filePath = path.join(__dirname, "statics", req.url);
    fs.stat(filePath, function(err, fileInfo) {
        if (err || !fileInfo.isFile()) {
            res.status(404).send("File not found!");
        } else {
            next();
        }
    });
});

// start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});