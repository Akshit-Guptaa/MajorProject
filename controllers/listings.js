const Listing = require("../models/listing.js");
const axios = require("axios");

module.exports.index = async (req, res) => {
    const { category, search } = req.query; // Capture both category and search queries
    let filter = {};

    if (category) {
        filter = { category: { $in: [category] } };
    }else if (search) {
        filter = {
            $or: [
                { title: { $regex: search, $options: "i" } },    // 'i' makes it case-insensitive
                { location: { $regex: search, $options: "i" } },
                { country: { $regex: search, $options: "i" } }
            ]
        };
    }
    const allListings = await Listing.find(filter);
    res.render("listings/index.ejs", { allListings, category, search });
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