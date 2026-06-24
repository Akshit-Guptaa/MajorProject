require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");

const dbUrl = process.env.ATLASDB_URL;

mongoose.connect(dbUrl)
  .then(() => console.log("Connected to DB for seeding"))
  .catch(err => console.error("DB connection error:", err));

const sampleLocations = ["Bali, Indonesia", "Paris, France", "Tokyo, Japan", "Rome, Italy", "New York City, USA", "London, UK", "Santorini, Greece", "Maui, Hawaii", "Kyoto, Japan", "Rio de Janeiro, Brazil"];
const sampleTitles = ["Luxury Villa", "Cozy Cottage", "Modern Apartment", "Oceanfront House", "Mountain Cabin", "Historic Castle", "Penthouse Suite", "Charming Studio", "Rustic Farmhouse", "Eco-friendly Tiny Home"];
const sampleImages = [
    "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1449844908441-8829872d2607?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1502672260266-1c1e525044c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1506929562872-bb421503ef21?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1480796927426-f609979314bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
];
const categories = ["Trending", "Rooms", "Iconic Cities", "Mountains", "Castles", "Amazing Pools", "Farms", "Arctic", "Beaches", "Deserts", "Tiny Homes"];

const generateRandomListing = () => {
    const loc = sampleLocations[Math.floor(Math.random() * sampleLocations.length)];
    const country = loc.split(", ")[1];
    
    return {
        title: sampleTitles[Math.floor(Math.random() * sampleTitles.length)] + " in " + loc.split(",")[0],
        description: "Experience the ultimate getaway in this beautiful property. Perfect for relaxing and unwinding in style.",
        image: {
            url: sampleImages[Math.floor(Math.random() * sampleImages.length)],
            filename: "randomimage"
        },
        price: Math.floor(Math.random() * 20000) + 1500, // random price between 1500 and 21500
        location: loc,
        country: country,
        geometry: {
            type: "Point",
            coordinates: [(Math.random() * 360) - 180, (Math.random() * 180) - 90] // Random lat/lon
        },
        category: [categories[Math.floor(Math.random() * categories.length)]],
        owner: "69c2dfba8d48366d67e0eeb4" // default dummy owner ID from init
    };
};

async function seed() {
    console.log("Generating 50 listings...");
    const newDocs = [];
    for(let i = 0; i < 50; i++) {
        newDocs.push(generateRandomListing());
    }
    
    await Listing.insertMany(newDocs);
    console.log("Successfully inserted 50 random listings into the database!");
    
    mongoose.connection.close();
    console.log("Database connection closed.");
}

seed();
