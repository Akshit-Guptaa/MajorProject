const Listing = require("../models/listing.js");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { generateEmbedding, cosineSimilarity } = require("../utils/embedding.js");

module.exports.index = async (req, res) => {
    const { category, search, sort, page = 1 } = req.query; // Capture query params
    let filter = {};

    if (category) {
        filter = { category: { $in: [category] } };
    }

    // Determine sorting order
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === "price_asc") {
        sortOption = { price: 1 };
    } else if (sort === "price_desc") {
        sortOption = { price: -1 };
    }

    const limit = 1000; // Load all listings (up to 1000) at once
    const currentPage = 1;
    
    let allListings = [];
    let totalListings = 0;

    if (search) {
        // SEMANTIC SEARCH LOGIC
        const searchEmbedding = await generateEmbedding(search);
        
        const listingsToCompare = await Listing.find(filter);
        
        let scoredListings = listingsToCompare.map(listing => {
            let score = 0;
            // Check if both embeddings exist and are valid (not all zeros)
            if (listing.embedding && listing.embedding.length > 0 && searchEmbedding.some(v => v !== 0)) {
                score = cosineSimilarity(searchEmbedding, listing.embedding);
            } else {
                 // Fallback to basic string inclusion if embeddings fail or missing API Key
                 const searchLower = search.toLowerCase();
                 if (listing.title.toLowerCase().includes(searchLower) || listing.location.toLowerCase().includes(searchLower) || (listing.description && listing.description.toLowerCase().includes(searchLower))) {
                     score = 1; // High score for direct match
                 } else {
                     score = -1; // Very low score
                 }
            }
            return { listing, score };
        });
        
        // Filter out very low scores (threshold 0.65 means highly related)
        scoredListings = scoredListings.filter(item => item.score > 0.65 || item.score === 1);
        
        // Sort by score descending
        scoredListings.sort((a, b) => b.score - a.score);
        
        totalListings = scoredListings.length;
        
        // Apply in-memory pagination
        const startIndex = (currentPage - 1) * limit;
        const endIndex = startIndex + limit;
        allListings = scoredListings.slice(startIndex, endIndex).map(item => item.listing);
    } else {
        // STANDARD QUERY LOGIC
        const skip = (currentPage - 1) * limit;
        totalListings = await Listing.countDocuments(filter);
        console.log("DEBUG: totalListings =", totalListings, "limit =", limit, "filter =", filter);

        allListings = await Listing.find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(limit);
    }

    const totalPages = Math.ceil(totalListings / limit) || 1;

    res.render("listings/index.ejs", { 
        allListings, 
        category, 
        search, 
        sort, 
        currentPage, 
        totalPages, 
        totalListings 
    });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async(req, res) => {
  let {id} = req.params;
  const listing = await Listing.findById(id).populate({ path:"reviews", populate: { path:"author",},}).populate("owner");
  if(!listing){
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", {listing});
};

module.exports.createListing = async (req, res) => {
  let { location } = req.body.listing;
  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = {url, filename};

  const textToEmbed = `${newListing.title} ${newListing.description} ${newListing.location} ${newListing.category ? newListing.category.join(' ') : ''}`;
  const embedding = await generateEmbedding(textToEmbed);
  newListing.embedding = embedding;

  try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`, {
            headers: { 'User-Agent': 'TravelBug' } // Nominatim requires this
        });

        if (response.data && response.data.length > 0) {
            const lat = parseFloat(response.data[0].lat);
            const lon = parseFloat(response.data[0].lon);
            newListing.geometry = {
                type: "Point",
                coordinates: [lon, lat] // [Longitude, Latitude]
            };
        }
    } catch (err) {
        console.log("Geocoding failed:", err);
    }

  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
  };

  module.exports.renderEditForm = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
      req.flash("error", "Listing you requested does not exist!");
      return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
  }; 

 module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    if (typeof req.body.listing.category === "undefined") {
        req.body.listing.category = [];
    }
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    if (req.body.listing.location) {
        try {
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(req.body.listing.location)}`,
                { headers: { 'User-Agent': 'TravelBug-App' } }
            );

            if (response.data && response.data.length > 0) {
                const lat = parseFloat(response.data[0].lat);
                const lon = parseFloat(response.data[0].lon);
                listing.geometry = {
                    type: "Point",
                    coordinates: [lon, lat]
                };
            }
        } catch (err) {
            console.log("Geocoding update failed:", err);
        }
    }
    Object.assign(listing, req.body.listing);
    
    const textToEmbed = `${listing.title} ${listing.description} ${listing.location} ${listing.category ? listing.category.join(' ') : ''}`;
    const embedding = await generateEmbedding(textToEmbed);
    listing.embedding = embedding;
    
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
    }
    await listing.save();
    
    req.flash("success", "Listing Updated Successfully!");
    res.redirect(`/listings/${id}`);
};

  module.exports.destroyListing = async(req, res) =>{
  let {id} = req.params;
  let deleteListing = await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};