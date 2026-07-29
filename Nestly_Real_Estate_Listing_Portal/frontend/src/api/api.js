import axios from "axios";

const API_BASE = "http://localhost:4000/api";

const api = axios.create({ baseURL: API_BASE });

// -------- auth --------
export const loginUser = (data) => api.post("/login", data);

// -------- listings --------
export const getListings = (params) => api.get("/listings", { params });
export const getListingLocations = () => api.get("/listings/locations");
export const getListingById = (id) => api.get(`/listings/${id}`);
export const createListing = (data) => api.post("/listings", data);
export const toggleFavorite = (id, username) =>
  api.put(`/listings/${id}/favorite`, { username });

// -------- chat history (live messages travel over socket.io separately) --------
export const getMessageHistory = (listingId) =>
  api.get("/messages", { params: listingId ? { listingId } : {} });

export const clearChatHistory = (listingId) =>
  api.delete("/messages", { params: listingId ? { listingId } : {} });

// -------- mortgage calculator --------
export const runCalculation = (data) => api.post("/calculations", data);
export const getCalculationHistory = (username) =>
  api.get("/calculations", { params: { username } });

// -------- agent plans & dashboard --------
export const getPlanOptions = () => api.get("/agents/plans");
export const getAgentDashboard = (username) => api.get(`/agents/${username}/dashboard`);
export const updateAgentPlan = (username, plan) =>
  api.put(`/agents/${username}/plan`, { plan });

export { API_BASE };
