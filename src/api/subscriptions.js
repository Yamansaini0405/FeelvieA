import client from "./client";

// Get all user subscriptions
export const listSubscriptions = async () => {
  return client.get("/api/admin/user-subscriptions/");
};

// Get specific subscription by ID
export const getSubscriptionById = async (id) => {
  return client.get(`/api/admin/user-subscriptions/${id}/`);
};
