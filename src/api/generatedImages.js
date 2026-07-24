import client from "./client";

export const listGeneratedImages = () => client.get("/api/admin/generated-images/");
