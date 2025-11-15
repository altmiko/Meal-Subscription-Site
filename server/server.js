import express from "express";
import cors from "cors";
import movies from "./routes/movies.js";
import { config } from "dotenv";
config(); // Will automatically look for .env file

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/movies", movies);
app.get('/', (req, res) => {
  res.send('Hello World!')
});


// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});