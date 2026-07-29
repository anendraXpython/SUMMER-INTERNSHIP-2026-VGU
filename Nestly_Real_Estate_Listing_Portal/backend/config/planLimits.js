const PLAN_LIMITS = {
  basic: {
    label: "Basic",
    monthlyPrice: 0,
    listingLimit: 5,
    analytics: false,
    featured: false,
  },
  pro: {
    label: "Pro",
    monthlyPrice: 29,
    listingLimit: 20,
    analytics: true,
    featured: false,
  },
  premium: {
    label: "Premium",
    monthlyPrice: 79,
    listingLimit: Infinity,
    analytics: true,
    featured: true,
  },
};

module.exports = PLAN_LIMITS;
