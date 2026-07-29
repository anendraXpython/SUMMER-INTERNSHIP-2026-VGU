// ---------------------------------------------------------------------
// SAMPLE DATA NOTICE
// GreatSchools' real API requires a paid, approved API key that this
// project does not have. This file generates realistic-looking but
// SIMULATED ratings instead, so the feature is fully wired up end to end.
//
// To swap in the real thing later: replace the body of getSchoolRatings()
// with a fetch() call to GreatSchools' API (they key ratings off lat/lng
// or zip code), keeping the same return shape so nothing else has to change.
// ---------------------------------------------------------------------

const SAMPLE_DISTRICT_NAMES = [
  "Riverside Unified School District",
  "Hillcrest County Schools",
  "Maple Valley School District",
  "Northgate Public Schools",
  "Lakeside Unified District",
];

const SAMPLE_SCHOOL_SUFFIXES = [
  "Elementary School",
  "Middle School",
  "High School",
];

// simple deterministic hash so the SAME listing always gets the SAME
// rating (instead of a random number changing every time you refresh)
function hashToNumber(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getSchoolRatings(listing) {
  const seed = hashToNumber(listing.location + listing._id);

  const districtName = SAMPLE_DISTRICT_NAMES[seed % SAMPLE_DISTRICT_NAMES.length];
  const overallRating = 3 + (seed % 8); // a rating from 3 to 10

  const nearbySchools = SAMPLE_SCHOOL_SUFFIXES.map((suffix, index) => {
    const schoolSeed = seed + index * 17;
    return {
      name: `${listing.location} ${suffix}`,
      rating: 3 + (schoolSeed % 8),
      distanceMiles: (0.3 + (schoolSeed % 20) / 10).toFixed(1),
    };
  });

  return {
    isSampleData: true,
    district: districtName,
    overallRating,
    nearbySchools,
  };
}

module.exports = { getSchoolRatings };
