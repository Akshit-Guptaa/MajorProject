require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const { generateEmbedding } = require("./utils/embedding.js");

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/travelbug";

async function main() {
    console.log("Connecting to Database...");
    await mongoose.connect(dbUrl, {
        serverSelectionTimeoutMS: 10000,
    });
    console.log("Connected. Finding listings without embeddings...");

    // Process all listings to overwrite the failed ones
    const listings = await Listing.find({});
    
    console.log(`Found ${listings.length} listings to process.`);

    for (let i = 0; i < listings.length; i++) {
        const listing = listings[i];
        console.log(`Processing ${i + 1}/${listings.length}: ${listing.title}`);
        
        const textToEmbed = `${listing.title} ${listing.description} ${listing.location} ${listing.category ? listing.category.join(' ') : ''}`;
        
        try {
            const embedding = await generateEmbedding(textToEmbed);
            listing.embedding = embedding;
            await listing.save();
            
            // Sleep for a short time to avoid rate limits (e.g. 500ms)
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
            console.error(`Failed to generate embedding for ${listing.title}:`, err);
        }
    }

    console.log("Finished generating embeddings!");
    mongoose.connection.close();
}

main().catch(err => {
    console.error(err);
    mongoose.connection.close();
});
