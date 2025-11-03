import { MongoClient, ServerApiVersion } from "mongodb";
import { config } from "dotenv";
config({ path: "./.env" });

const uri = process.env.ATLAS_URI || "";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

try {
    // Connect the client to the server
    await client.connect();
    // Ping to confirm successful connection
    await client.db("admin").command({ ping: 1});
    console.log("Pinged your deployment. Successfully connected to MongoDB!");
} catch (err) {
    console.log(err)
}

let db = client.db("sample_mflix")

export default db;