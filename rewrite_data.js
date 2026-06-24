const fs = require("fs");
const { data } = require("./init/data.js");

const categories = [
  "Trending", "Rooms", "Iconic Cities", "Mountains", "Castles", 
  "Amazing Pools", "Farms", "Arctic", "Beaches", "Deserts", "Tiny Homes"
];

const newData = data.map(listing => {
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

    return { ...listing, category: cats };
});

const fileContent = `const sampleListings = ${JSON.stringify(newData, null, 2)};\n\nmodule.exports = { data: sampleListings };\n`;

fs.writeFileSync("./init/data.js", fileContent);
console.log("Updated init/data.js");
