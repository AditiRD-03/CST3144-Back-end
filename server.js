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