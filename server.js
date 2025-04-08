const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const path = require("path");
const fs = require("fs");
const { ObjectId } = require('mongodb'); // Import ObjectId to handle MongoDB object IDs

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
