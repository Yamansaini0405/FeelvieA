import client from "./client";

export const listCreditPacks = () => client.get("/api/wallet/credit-packs/");
export const createCreditPack = (data) =>
  client.post("/api/admin/credit-packs/", data);
export const updateCreditPack = (id, data) =>
  client.put(`/api/admin/credit-packs/${id}/`, data);
