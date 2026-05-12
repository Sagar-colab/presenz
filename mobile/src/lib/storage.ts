import * as SecureStore from "expo-secure-store";

// Thin wrapper around expo-secure-store. We use this for tokens + any data
// that should not survive an app uninstall in plaintext. For non-sensitive
// preference state, swap to AsyncStorage when added in Phase 5e.

const TOKEN_KEY = "presenz.auth.token";

export async function setAuthToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getAuthToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearAuthToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
