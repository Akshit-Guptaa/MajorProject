const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const { generateEmbedding } = require("../utils/embedding.js");
require("dotenv").config({ path: "../.env" });

// const MONGO_URL = "mongodb://127.0.0.1:27017/travelbug";
const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
    await mongoose.connect(dbUrl);
}

const initDB = async () => {
    await Listing.deleteMany({});
    
    // Attach owner and generate embeddings for init data
    const listingsWithEmbeddings = [];
    console.log("Generating embeddings for init data. This may take a minute...");
    
    for (let obj of initData.data) {
        const textToEmbed = `${obj.title}. ${obj.description} Location: ${obj.location}, ${obj.country}. Category: ${obj.category}`;
        const embedding = await generateEmbedding(textToEmbed);
        
        listingsWithEmbeddings.push({
            ...obj, 
            owner: "69c2dfba8d48366d67e0eeb4",
            embedding: embedding && embedding.length > 0 ? embedding : []
        });
    }
    
    await Listing.insertMany(listingsWithEmbeddings);
    console.log("data was initiallized with semantic embeddings!");
};

initDB();