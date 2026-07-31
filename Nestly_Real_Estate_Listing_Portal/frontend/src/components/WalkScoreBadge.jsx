function WalkScoreBadge({ walkScoreData }) {
  if (!walkScoreData) return null;

  return (
    <div className="walk-score-badge">
      <div className="walk-score-header">
        <span className="walk-score-num">{walkScoreData.walkScore}</span>
        <span className="walk-score-desc">{walkScoreData.walkDescription}</span>
        <span
          className="sample-tag"
          title="Walk Score's real API requires an approved key; this is realistic sample data."
        >
          sample data
        </span>
      </div>
      <div className="walk-score-sub">
        <span>Transit Score: <strong>{walkScoreData.transitScore}</strong></span>
        <span>Bike Score: <strong>{walkScoreData.bikeScore}</strong></span>
      </div>
    </div>
  );
}

export default WalkScoreBadge;
