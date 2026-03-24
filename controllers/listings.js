module.exports.index = async (req, res) => {
  try {
    const { q, filter } = req.query;

    const escapeRegex = (text = "") =>
      text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    let allListings;

    if (filter && filter.trim().length > 0) {
      const f = filter.trim();

      const categoryMap = {
        'Iconic Cities': 'Cities',
        'Mountains': 'Mountains',
        'Amazing Pools': 'Amazing Pools',
        'Castles': 'Castles',
        'Camping': 'Camping',
        'Farms': 'Farms',
        'Arctic': 'Arctic'
      };

      if (f === 'Trending') {
        allListings = await Listing.aggregate([
          {
            $lookup: {
              from: 'reviews',
              localField: 'reviews',
              foreignField: '_id',
              as: 'reviews_docs'
            }
          },
          {
            $addFields: {
              avgRating: { $avg: '$reviews_docs.rating' }
            }
          },
          { $sort: { avgRating: -1 } }
        ]);
      } else if (categoryMap[f]) {
        allListings = await Listing.find({ categories: categoryMap[f] });
      } else if (q && q.trim().length > 0) {
        const safe = escapeRegex(q.trim());
        const regex = new RegExp(safe, "i");

        allListings = await Listing.find({
          $or: [
            { title: regex },
            { location: regex },
            { country: regex }
          ]
        });
      } else {
        allListings = await Listing.find({});
      }
    } else {
      if (q && q.trim().length > 0) {
        const safe = escapeRegex(q.trim());
        const regex = new RegExp(safe, "i");

        allListings = await Listing.find({
          $or: [
            { title: regex },
            { location: regex },
            { country: regex }
          ]
        });
      } else {
        allListings = await Listing.find({});
      }
    }

    res.render("listings/index.ejs", {
      allListings: allListings || [],
      q: q || "",
      filter: filter || ""
    });

  } catch (err) {
    console.error("❌ INDEX ERROR:", err);
    res.status(500).send("Internal Server Error (Index)");
  }
};