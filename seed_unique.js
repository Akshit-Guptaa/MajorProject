require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");

const dbUrl = process.env.ATLASDB_URL;

mongoose.connect(dbUrl)
  .then(() => console.log("Connected to DB for seeding"))
  .catch(err => console.error("DB connection error:", err));

const adjectives = ["Breathtaking", "Secluded", "Luxury", "Charming", "Rustic", "Modern", "Historic", "Peaceful", "Vibrant", "Eco-friendly", "Spacious", "Cozy", "Grand", "Minimalist", "Romantic", "Magical", "Sunlit", "Hidden", "Stylish", "Boutique"];
const nouns = ["Villa", "Cottage", "Apartment", "House", "Cabin", "Castle", "Penthouse", "Studio", "Farmhouse", "Tiny Home", "Mansion", "Chalet", "Treehouse", "Bungalow", "Loft", "Retreat", "Oasis", "Estate", "Lodge", "Hideaway"];

const cities = ["Paris", "Tokyo", "Rome", "New York", "London", "Santorini", "Maui", "Kyoto", "Rio", "Sydney", "Cape Town", "Barcelona", "Dubai", "Bangkok", "Istanbul", "Amsterdam", "Prague", "Venice", "Havana", "Zurich"];
const countries = ["France", "Japan", "Italy", "USA", "UK", "Greece", "Hawaii", "Japan", "Brazil", "Australia", "South Africa", "Spain", "UAE", "Thailand", "Turkey", "Netherlands", "Czechia", "Italy", "Cuba", "Switzerland"];

const categories = ["Trending", "Rooms", "Iconic Cities", "Mountains", "Castles", "Amazing Pools", "Farms", "Arctic", "Beaches", "Deserts", "Tiny Homes"];

const generateRandomListing = (index) => {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const locIdx = Math.floor(Math.random() * cities.length);
    const city = cities[locIdx];
    const country = countries[locIdx];
    
    // Picsum is perfectly reliable for placeholder images. Seed parameter ensures a unique image per listing!
    const imageUrl = `https://picsum.photos/seed/${index + Math.random()}/800/600`;
    
    return {
        title: `${adj} ${noun} in ${city}`,
        description: `Experience the ultimate getaway in this ${adj.toLowerCase()} property. Located in the heart of ${city}, ${country}. Perfect for relaxing and unwinding in style. Includes free WiFi and amazing views!`,
        image: {
            url: imageUrl,
            filename: `picsum-${index}`
        },
        price: Math.floor(Math.random() * 15000) + 2000, 
        location: `${city}, ${country}`,
        country: country,
        geometry: {
            type: "Point",
            coordinates: [(Math.random() * 360) - 180, (Math.random() * 180) - 90] 
        },
        category: [categories[Math.floor(Math.random() * categories.length)]],
        owner: "69c2dfba8d48366d67e0eeb4" 
    };
};

async function seed() {
    console.log("Clearing old listings...");
    await Listing.deleteMany({});
    
    console.log("Generating 50 completely reliable listings...");
    const newDocs = [];
    for(let i = 0; i < 50; i++) {
        newDocs.push(generateRandomListing(i));
    }
    
    await Listing.insertMany(newDocs);
    console.log("Successfully wiped DB and inserted exactly 50 listings!");
    
    mongoose.connection.close();
    console.log("Database connection closed.");
}

seed();
