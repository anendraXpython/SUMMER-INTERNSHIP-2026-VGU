const Listing = require("../models/Listing");

// This one is REAL, not simulated: it queries our own live listings
// collection for other properties of the same type, in the same location,
// within +/-25% of this listing's price -- the standard definition of a
// "comparable" used by real appraisers, just without external MLS data.
async function getComparableSales(listing) {
  const priceMin = listing.price * 0.75;
  const priceMax = listing.price * 1.25;

  let comparables = await Listing.find({
    _id: { $ne: listing._id },
    location: listing.location,
    propertyType: listing.propertyType,
    price: { $gte: priceMin, $lte: priceMax },
  })
    .sort({ createdAt: -1 })
    .limit(6);

  // Not enough close matches? Widen to "same location, any type/price" so
  // the section still has something useful instead of coming up empty.
  if (comparables.length < 3) {
    const excludeIds = [listing._id, ...comparables.map((c) => c._id)];
    const wider = await Listing.find({
      _id: { $nin: excludeIds },
      location: listing.location,
    }).limit(6 - comparables.length);
    comparables = [...comparables, ...wider];
  }

  return comparables.map((c) => ({
    id: c._id,
    title: c.title,
    price: c.price,
    pricePerSqft: Math.round(c.price / c.sqft),
    beds: c.beds,
    baths: c.baths,
    sqft: c.sqft,
    status: c.status,
    image: c.image,
  }));
}

module.exports = { getComparableSales };
