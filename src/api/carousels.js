import client from "./client";

export const listCarousels = () => client.get("/api/common/carousels/");
export const createCarousel = (data) =>
  client.post("/api/common/carousels/", data);
export const updateCarousel = (id, data) =>
  client.patch(`/api/common/carousels/${id}/`, data);
export const deleteCarousel = (id) =>
  client.delete(`/api/common/carousels/${id}/`);
