function AboutSection() {
  return (
    <section id="about">
      <h2>About Nestly</h2>
      <p>
        Nestly is a full-stack real estate portal that helps buyers search homes, compare
        mortgage costs, chat live with agents, and helps agents list and manage their own
        properties. Everything you see here — listings, chat messages, calculations, saved
        searches, price history — is real data stored in a live database, not sample
        placeholders (the only clearly-labeled sample data is school ratings and Walk Score,
        since those real third-party APIs require paid/approved keys this project doesn't have).
      </p>

      <div className="about-grid">
        <div className="about-card">
          <h3>1. Search &amp; Filter</h3>
          <p>
            Use the search bar to filter by location, price, number of beds, and property
            type. Sort by newest or price to narrow things down quickly.
          </p>
        </div>

        <div className="about-card">
          <h3>2. Compare on the Map</h3>
          <p>
            Open Map Search to see every listing plotted by location. Draw a shape around
            a neighborhood you like to see only the properties inside it, or turn on the
            price heatmap to spot expensive vs. affordable areas at a glance.
          </p>
        </div>

        <div className="about-card">
          <h3>3. Check the Real Numbers</h3>
          <p>
            Click "View Details" on any listing to see school ratings, Walk Score, comparable
            listings nearby, and its full price history over time. Then head to the Mortgage
            Calculator to see your actual estimated monthly payment, not a rough guess — it
            includes a year-by-year breakdown of how much goes to interest vs. principal.
          </p>
        </div>

        <div className="about-card">
          <h3>4. Talk to an Agent</h3>
          <p>
            Every listing has its own live chat thread. Open a property's details and use
            Live Chat to ask the listing agent questions directly, in real time.
          </p>
        </div>

        <div className="about-card">
          <h3>5. Save Your Favorites &amp; Searches</h3>
          <p>
            Click the heart icon on any listing to save it. Save a search from the listings
            page and Nestly will email you automatically whenever a new property matches it.
          </p>
        </div>

        <div className="about-card">
          <h3>6. Tour Homes Virtually</h3>
          <p>
            Listings with a Matterport or Kuula link show an embedded, walkable 3D tour right
            on the details page — no site visit required to get a feel for the space.
          </p>
        </div>
      </div>

      <h3 className="about-subheading">How to Choose the Right House</h3>
      <ul className="about-tips">
        <li><strong>Set a real budget first.</strong> Use the Mortgage Calculator before you fall in love with a listing — know your monthly payment, not just the sticker price.</li>
        <li><strong>Location matters more than the house itself.</strong> Check nearby school ratings, Walk Score, and use the map to see what's actually around the property.</li>
        <li><strong>Price per sqft tells the real story.</strong> Each listing card shows this — it helps you compare homes of different sizes fairly.</li>
        <li><strong>Compare against similar homes.</strong> The Comparable Listings section on each property shows what similar homes nearby are priced at.</li>
        <li><strong>Watch the price history.</strong> A listing that's had multiple price drops tells a different story than one that just came on the market.</li>
        <li><strong>Don't skip the numbers over time.</strong> The amortization chart shows how your loan balance shrinks — a lower rate can save you far more over 20-30 years than it looks like month-to-month.</li>
        <li><strong>Ask questions early.</strong> Use the chat to ask the agent about anything the listing doesn't mention — condition, taxes, HOA fees, move-in timeline.</li>
      </ul>
    </section>
  );
}

export default AboutSection;
