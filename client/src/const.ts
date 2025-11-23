export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "App";

export const APP_LOGO = "/logo.jpg";

// Login URL for local authentication (not using external OAuth portal )
export const getLoginUrl = () => {
  return "/login";
};
