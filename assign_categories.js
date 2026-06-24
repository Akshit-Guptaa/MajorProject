require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/travelbug";

const categories = [
  "Trending", "Rooms", "Iconic Cities", "Mountains", "Castles", 
  "Amazing Pools", "Farms", "Arctic", "Beaches", "Deserts", "Tiny Homes"
];

async function main() {
  await mongoose.connect(dbUrl);
  console.log("Connected to DB");

  const listings = await Listing.find({});
  let count = 0;

  for (let listing of listings) {
    // If it already has categories, skip or override. We will override for testing.
    // Assign 1 or 2 random categories based on title/description to make it somewhat realistic
    let cats = [];
    let text = (listing.title + " " + listing.description).toLowerCase();
    
    if (text.includes("beach") || text.includes("ocean") || text.includes("sea")) cats.push("Beaches");
    if (text.includes("mountain") || text.includes("alps") || text.includes("ski") || text.includes("rockies") || text.includes("aspen")) cats.push("Mountains");
    if (text.includes("city") || text.includes("downtown") || text.includes("tokyo") || text.includes("boston") || text.includes("miami")) cats.push("Iconic Cities");
    if (text.includes("castle") || text.includes("historic") || text.includes("villa")) cats.push("Castles");
    if (text.includes("pool")) cats.push("Amazing Pools");
    if (text.includes("farm") || text.includes("nature") || text.includes("lake") || text.includes("treehouse") || text.includes("cabin")) cats.push("Farms");
    if (text.includes("desert") || text.includes("dubai")) cats.push("Deserts");
    
    if (cats.length === 0) {
        cats.push(categories[Math.floor(Math.random() * categories.length)]);
    }

    listing.category = cats;
    await listing.save();
    count++;
  }

  console.log(`Updated ${count} listings with categories!`);
  process.exit(0);
}

main().catch(console.error);
