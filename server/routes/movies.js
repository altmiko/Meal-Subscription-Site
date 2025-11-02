import express from "express";
import db from "../db/connection.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// Get a list of all the movies
router.get("/", async (req, res) => {
  let collection = await db.collection("movies");
  let results = await collection.find({}).toArray();
  res.status(200).send(results);   
});

// Get a single record by id
router.get("/:id", async (req, res) => {
  let collection = await db.collection("movies");
  let query = { _id: new ObjectId(req.params.id) };
  let result = await collection.findOne(query);
  
  if (!result) {
    res.status(404).send("Not found");   
  } else {
    res.status(200).send(result);   
  }
});

// Create a new record
router.post("/", async (req, res) => {
  try {
    let newDocument = {
      name: req.body.name,
      position: req.body.position,
      level: req.body.level,
    };
    let collection = await db.collection("movies");
    let result = await collection.insertOne(newDocument);
    res.status(204).send(result);   
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding record");
  }
});

// Update a record by id
router.patch("/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };
    const updates = {
      $set: {
        name: req.body.name,
        position: req.body.position,
        level: req.body.level,
      },
    };
    let collection = await db.collection("movies");
    let result = await collection.updateOne(query, updates);
    res.status(200).send(result);   
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating record");
  }
});

// Delete a record
router.delete("/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };
    const collection = await db.collection("movies");  // ✅ Added await for consistency
    let result = await collection.deleteOne(query);
    res.status(200).send(result);   
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting record");
  }
});

export default router;