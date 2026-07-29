function SchoolRatingBadge({ schoolRatings }) {
  if (!schoolRatings) return null;

  return (
    <div className="school-ratings">
      <div className="school-ratings-header">
        <span className="school-score">{schoolRatings.overallRating}/10</span>
        <span>{schoolRatings.district}</span>
        <span className="sample-tag" title="GreatSchools API requires a paid key; this is realistic sample data.">
          sample data
        </span>
      </div>
      <ul>
        {schoolRatings.nearbySchools.map((school) => (
          <li key={school.name}>
            {school.name} — {school.rating}/10 ({school.distanceMiles} mi)
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SchoolRatingBadge;
