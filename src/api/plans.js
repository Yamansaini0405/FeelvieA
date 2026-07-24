import client from "./client";

export const listPlans = () => client.get("/api/wallet/subscription-plans/");
export const createPlan = (data) =>
  client.post("/api/admin/subscription-plans/", data);
export const updatePlan = (id, data) =>
  client.put(`/api/admin/subscription-plans/${id}/`, data);
