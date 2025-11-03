import express from "express";
import { connectToDatabase } from "./db.js";

const app = express();

app.get("/movies", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const movies = await db.collection("movies").find().limit(10).toArray();
    res.json(movies);
  } catch (err) {
    console.error("Error fetching movies:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(process.env.PORT || 5000, () =>
  console.log("Server running on port", process.env.PORT || 5000)
);
