// ---------------------------------------------------------------------
// SAMPLE DATA NOTICE
// Walk Score's real API (walkscore.com/professional/api) requires a free
// but approved API key that this project does not have. This file
// generates realistic-looking but SIMULATED walk/transit/bike scores
// instead, exactly like schoolRatingsService.js does for GreatSchools.
//
// To swap in the real thing later: request a key from Walk Score, then
// replace the body of getWalkScore() with a fetch() call keyed off
// listing.lat / listing.lng, keeping the same return shape.
// ---------------------------------------------------------------------

function hashToNumber(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function describeWalkScore(score) {
  if (score >= 90) return "Walker's Paradise — daily errands do not require a car";
  if (score >= 70) return "Very Walkable — most errands can be accomplished on foot";
  if (score >= 50) return "Somewhat Walkable — some errands can be accomplished on foot";
  if (score >= 25) return "Car-Dependent — most errands require a car";
  return "Car-Dependent — almost all errands require a car";
}

function getWalkScore(listing) {
  const seed = hashToNumber(listing.location + listing._id + "walk");

  const walkScore = 15 + (seed % 85);
  const transitScore = 10 + ((seed + 29) % 85);
  const bikeScore = 15 + ((seed + 53) % 80);

  return {
    isSampleData: true,
    walkScore,
    walkDescription: describeWalkScore(walkScore),
    transitScore,
    bikeScore,
  };
}

module.exports = { getWalkScore };
