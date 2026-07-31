const cron = require("node-cron");
const SavedSearch = require("../models/SavedSearch");
const Listing = require("../models/Listing");
const User = require("../models/User");
const { sendMail } = require("./emailService");

function buildFilterFromSavedSearch(filters) {
  const filter = {};
  if (filters.location) filter.location = { $regex: filters.location, $options: "i" };
  if (filters.propertyType) filter.propertyType = filters.propertyType;
  if (filters.beds) filter.beds = { $gte: filters.beds };
  if (filters.minPrice || filters.maxPrice) {
    filter.price = {};
    if (filters.minPrice) filter.price.$gte = filters.minPrice;
    if (filters.maxPrice) filter.price.$lte = filters.maxPrice;
  }
  return filter;
}

// Re-runs every saved search's filter against listings created since the
// last time we alerted that search, and emails the buyer if there are new
// matches. This is the real logic behind "saved searches + email alerts" --
// the only "simulated" part of the whole feature is the email transport
// itself when SMTP isn't configured (see emailService.js).
async function checkSavedSearches() {
  const searches = await SavedSearch.find({ emailAlerts: true });
  let alertsSent = 0;

  for (const search of searches) {
    try {
      const filter = buildFilterFromSavedSearch(search.filters);
      filter.createdAt = { $gt: search.lastAlertedAt };

      const newMatches = await Listing.find(filter).sort({ createdAt: -1 }).limit(10);

      if (newMatches.length > 0) {
        const user = await User.findOne({ username: search.username });

        if (user) {
          const listRows = newMatches
            .map(
              (l) =>
                `<li>${l.title} — $${l.price.toLocaleString()} (${l.location}, ${l.beds} bd)</li>`
            )
            .join("");

          await sendMail({
            to: user.email,
            subject: `Nestly: ${newMatches.length} new listing(s) match "${search.label}"`,
            html: `<p>Hi ${user.username},</p><p>New properties matching your saved search "<strong>${search.label}</strong>":</p><ul>${listRows}</ul><p>— The Nestly team</p>`,
          });

          alertsSent += 1;
        }

        search.lastAlertedAt = new Date();
        await search.save();
      }
    } catch (error) {
      console.log("alert check failed for saved search", search._id, error.message);
    }
  }

  return { searchesChecked: searches.length, alertsSent };
}

function startAlertScheduler() {
  // Every 10 minutes. Real listings created in between get picked up on the
  // next run -- there's also a manual "/api/saved-searches/run-check-now"
  // endpoint the frontend uses for an instant demo instead of waiting.
  cron.schedule("*/10 * * * *", () => {
    checkSavedSearches().catch((error) =>
      console.log("saved-search scheduler error:", error.message)
    );
  });
  console.log("Saved-search email alert scheduler started (runs every 10 minutes).");
}

module.exports = { startAlertScheduler, checkSavedSearches };
