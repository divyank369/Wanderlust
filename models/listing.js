const mongoose = require("mongoose");
const { type } = require("os");
const { ref } = require("process");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String,
    filename: String,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ],
  owner:{
        type: Schema.Types.ObjectId,
        ref: "User",
  },
   geometry: {      // ✅ ye GeoJSON structure hai
    type: {
      type: String,
      enum: ['Point'], // Only "Point" supported
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  categories: {
    type: [String],
    enum: ['Mountains', 'Beaches', 'Cities', 'Countryside', 'Amazing Pools', 'Castles', 'Camping', 'Farms', 'Arctic']
  },
});
listingSchema.post("findOneAndDelete", async (listing) => {

   if(listing){
     await Review.deleteMany({ reviews: { $in: listing.reviews } });
   }
 
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
