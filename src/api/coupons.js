import client from "./client";

export const listCoupons = () => client.get("/api/wallet/admin/coupons/");
export const createCoupon = (data) =>
  client.post("/api/wallet/admin/coupons/", data);
export const updateCoupon = (id, data) =>
  client.patch(`/api/wallet/admin/coupons/${id}/`, data);
export const deleteCoupon = (id) =>
  client.delete(`/api/wallet/admin/coupons/${id}/`);
