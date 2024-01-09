const { MongoClient } = require("mongodb");
const mongoose = require('mongoose');
const config = require('../../server/config/config'); 
mongoose.Promise = global.Promise;

const uri = "mongodb://localhost:27017"; 
const dbName = "propeakdb"; 

let client;

async function connectToDatabase() {
  client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db(dbName);
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
}

function getDB() {
  if (!client) {
    throw new Error("Call connectToDatabase first");
  }
  return client.db(dbName);
}

async function closeDB() {
  if (client) {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

async function checkConnection() {
  let isConnected = false;
  try {
    const db = await connectToDatabase();
    if (db) {
      isConnected = true;
      console.log("Connection successful");
      await closeDB();
    }
  } catch (err) {
    console.error("Connection failed:", err);
  }
  return isConnected;
}



module.exports = { connectToDatabase, getDB, closeDB, checkConnection };
