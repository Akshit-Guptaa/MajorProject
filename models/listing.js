const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./reviews.js");
const { required } = require("joi");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
       url:String,
       filename: String,
    },
   price: {
  type: Number,
  required: true
},
    location: String,
    country: String,
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    geometry: {
    type: {
        type: String, 
        enum: ['Point'], 
        required: true
    },
    coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
    }
},
category: {
    type: [String],
    enum: ["Trending", "Rooms", "Iconic Cities", "Mountains", "Castles", "Amazing Pools", "Farms", "Arctic", "Beaches", "Deserts", "Tiny Homes"],
    required: true,
}
});

listingSchema.post("findOneAndDelete", async(listing) => {
  if(listing) {
  await Review.deleteMany({_id : {$in: listing.reviews}})
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;



