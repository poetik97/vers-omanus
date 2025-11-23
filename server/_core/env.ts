export const ENV = {
  appId: process.env.VITE_APP_ID ?? "organiza-te360",
  cookieSecret: process.env.JWT_SECRET ?? "dev-secret-key-change-in-production",
  databaseUrl: process.env.DATABASE_URL ?? "",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  isProduction: process.env.NODE_ENV === "production",
};
