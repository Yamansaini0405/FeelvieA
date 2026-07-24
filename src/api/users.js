import client from "./client";

export const listUsers = () => client.get("/api/admin/users/");
export const getUser = (id) => client.get(`/api/admin/users/${id}/`);
export const createUser = (data) => client.post("/api/admin/users/", data);
export const updateUser = (id, data) =>
  client.patch(`/api/admin/users/${id}/`, data);
export const deleteUser = (id) => client.delete(`/api/admin/users/${id}/`);
