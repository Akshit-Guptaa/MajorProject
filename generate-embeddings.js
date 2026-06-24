require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const { generateEmbedding } = require("./utils/embedding.js");

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/travelbug";

async function populateEmbeddings() {
    try {
        await mongoose.connect(dbUrl);
        console.log("Connected to db. Fetching listings...");
        
        const listings = await Listing.find({});
        console.log(`Found ${listings.length} listings. Generating embeddings...`);
        
        let count = 0;
        for (let listing of listings) {
            if (!listing.embedding || listing.embedding.length === 0) {
                const textToEmbed = `${listing.title}. ${listing.description} Location: ${listing.location}, ${listing.country}. Category: ${listing.category}`;
                const embedding = await generateEmbedding(textToEmbed);
                if (embedding && embedding.length > 0) {
                    listing.embedding = embedding;
                    await listing.save();
                    count++;
                    console.log(`Generated embedding for: ${listing.title}`);
                }
            }
        }
        
        console.log(`Successfully updated ${count} listings with new embeddings.`);
        process.exit(0);
    } catch (error) {
        console.error("Error populating embeddings:", error);
        process.exit(1);
    }
}

populateEmbeddings();
