import Constants from "expo-constants";

// API base URL: pulled from app.json expo.extra.apiBaseUrl. Override during
// local dev by editing app.json or by setting EXPO_PUBLIC_API_BASE_URL.

const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
const fromConfig = (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl;

export const API_BASE_URL = fromEnv ?? fromConfig ?? "https://presenz-opal.vercel.app";
