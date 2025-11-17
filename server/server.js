import express from "express";
import cors from "cors";
import { config } from "dotenv";
import connectDB from "./db/connection.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
config();

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.send('Backend API is running!')
});

app.use('/api/auth', authRoutes);

// Error handler middleware (must be last)
app.use(errorHandler);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
});
