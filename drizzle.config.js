/** @type { import("drizzle-kit").Config } */
export default {
  schema: "./utils/schema.js",
  dialect: "postgresql",
  dbCredentials: {
    url:"postgresql://neondb_owner:npg_EFVZo2rdbLB3@ep-shrill-sun-a8hraqzj-pooler.eastus2.azure.neon.tech/ai_mock?sslmode=require",
  },
};
