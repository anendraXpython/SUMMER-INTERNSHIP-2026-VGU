const Listing = require("../models/Listing");
const User = require("../models/User");

const SAMPLE_LISTINGS = [
  {
    title: "Maple Court Bungalow",
    location: "Rowanwood",
    price: 385000,
    beds: 3,
    baths: 2,
    sqft: 1450,
    propertyType: "House",
    status: "For Sale",
    yearBuilt: 2005,
    lat: 26.9124,
    lng: 75.7873,
    description: "A single-storey bungalow on a quiet cul-de-sac with a renovated kitchen.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=60",
  },
  {
    title: "The Elmhurst Loft",
    location: "Elm District",
    price: 612000,
    beds: 2,
    baths: 2,
    sqft: 1180,
    propertyType: "Condo",
    status: "For Sale",
    yearBuilt: 2018,
    lat: 26.92,
    lng: 75.8,
    description: "Converted warehouse loft with exposed brick and 11-foot ceilings.",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=500&q=60",
  },
  {
    title: "Birchwood Family Home",
    location: "Rowanwood",
    price: 745000,
    beds: 4,
    baths: 3,
    sqft: 2400,
    propertyType: "House",
    status: "Pending",
    yearBuilt: 2012,
    lat: 26.905,
    lng: 75.79,
    description: "Two-storey home with a finished basement and double garage.",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=500&q=60",
  },
  {
    title: "Harborview Apartment",
    location: "Old Harbor",
    price: 528000,
    beds: 2,
    baths: 1,
    sqft: 980,
    propertyType: "Apartment",
    status: "For Sale",
    yearBuilt: 2009,
    lat: 26.93,
    lng: 75.81,
    description: "Top-floor apartment with a partial water view and in-unit laundry.",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=500&q=60",
  },
  {
    title: "Cedarbrook Cottage",
    location: "Elm District",
    price: 299000,
    beds: 1,
    baths: 1,
    sqft: 720,
    propertyType: "House",
    status: "For Sale",
    yearBuilt: 1998,
    lat: 26.918,
    lng: 75.795,
    description: "A compact starter home with a wood-burning stove and small garden.",
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=500&q=60",
  },
  {
    title: "Sycamore Grove Villa",
    location: "Old Harbor",
    price: 899000,
    beds: 5,
    baths: 4,
    sqft: 3100,
    propertyType: "Villa",
    status: "For Sale",
    yearBuilt: 2020,
    lat: 26.935,
    lng: 75.805,
    description: "A grand villa with a private pool and gated driveway.",
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=500&q=60",
  },
  {
    title: "Willowbrook Townhouse",
    location: "Elm District",
    price: 452000,
    beds: 3,
    baths: 2,
    sqft: 1600,
    propertyType: "Townhouse",
    status: "For Sale",
    yearBuilt: 2016,
    lat: 26.922,
    lng: 75.788,
    description: "End-unit townhouse with a private rooftop terrace and attached garage.",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=500&q=60",
  },
  {
    title: "Old Harbor Studio",
    location: "Old Harbor",
    price: 210000,
    beds: 0,
    baths: 1,
    sqft: 540,
    propertyType: "Apartment",
    status: "Sold",
    yearBuilt: 2011,
    lat: 26.928,
    lng: 75.803,
    description: "Efficient studio steps from the waterfront promenade, recently sold.",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=500&q=60",
  },
  {
    title: "Rowanwood Duplex",
    location: "Rowanwood",
    price: 560000,
    beds: 3,
    baths: 2,
    sqft: 1750,
    propertyType: "House",
    status: "For Sale",
    yearBuilt: 2003,
    lat: 26.908,
    lng: 75.784,
    description: "A duplex with a rentable lower unit, ideal for house-hacking buyers.",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=500&q=60",
  },
];

async function seedIfEmpty() {
  const listingCount = await Listing.countDocuments();

  if (listingCount === 0) {
    // spread the sample listings across a demo agent account so the
    // "Agent Dashboard" has something real to show right away
    const demoAgent = await User.findOneAndUpdate(
      { username: "demo_agent" },
      { username: "demo_agent", email: "demo_agent@nestly.test", role: "agent", plan: "pro" },
      { upsert: true, new: true }
    );

    const listingsWithAgent = SAMPLE_LISTINGS.map((listing) => ({
      ...listing,
      agentUsername: demoAgent.username,
    }));

    await Listing.insertMany(listingsWithAgent);
    console.log("Seeded", listingsWithAgent.length, "sample listings under demo_agent.");
  }
}

module.exports = seedIfEmpty;
