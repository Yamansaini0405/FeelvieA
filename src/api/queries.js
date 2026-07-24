import client from "./client";

export const listQueries = () => client.get("/api/common/queries/");
export const getQuery = (id) => client.get(`/api/common/queries/${id}/`);
export const updateQuery = (id, data) => client.put(`/api/common/queries/${id}/`, data);

export default {
  listQueries,
  getQuery,
  updateQuery,
};
