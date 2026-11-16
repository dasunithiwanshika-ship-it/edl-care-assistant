import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "edl_access_token";
const ACCOUNT_KEY = "edl_account_number";
const USER_DATA_KEY = "edl_user_data";

// Fallback in-memory store for environments where SecureStore is unavailable (e.g. web/unit tests)
const memoryStore: Record<string, string> = {};

function getWebLocalStorage(): any {
  try {
    const g = globalThis as any;
    if (g && g.localStorage) {
      return g.localStorage;
    }
  } catch {
    // Ignore
  }
  return null;
}

async function isSecureStoreAvailable(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function saveAuthToken(token: string): Promise<void> {
  try {
    if (await isSecureStoreAvailable()) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
      memoryStore[TOKEN_KEY] = token;
      const ls = getWebLocalStorage();
      if (ls) ls.setItem(TOKEN_KEY, token);
    }
  } catch (err) {
    console.warn("Could not save auth token securely:", err);
    memoryStore[TOKEN_KEY] = token;
  }
}

export async function getAuthToken(): Promise<string | null> {
  try {
    if (await isSecureStoreAvailable()) {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } else {
      const ls = getWebLocalStorage();
      if (ls) return ls.getItem(TOKEN_KEY) || memoryStore[TOKEN_KEY] || null;
      return memoryStore[TOKEN_KEY] || null;
    }
  } catch (err) {
    console.warn("Could not read auth token securely:", err);
    return memoryStore[TOKEN_KEY] || null;
  }
}

export async function removeAuthToken(): Promise<void> {
  try {
    if (await isSecureStoreAvailable()) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
    delete memoryStore[TOKEN_KEY];
    const ls = getWebLocalStorage();
    if (ls) ls.removeItem(TOKEN_KEY);
  } catch (err) {
    console.warn("Could not remove auth token:", err);
    delete memoryStore[TOKEN_KEY];
  }
}

export async function saveSessionData(accountNumber: string, userData?: any): Promise<void> {
  try {
    if (await isSecureStoreAvailable()) {
      await SecureStore.setItemAsync(ACCOUNT_KEY, accountNumber);
      if (userData) {
        await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(userData));
      }
    } else {
      memoryStore[ACCOUNT_KEY] = accountNumber;
      if (userData) memoryStore[USER_DATA_KEY] = JSON.stringify(userData);
      const ls = getWebLocalStorage();
      if (ls) {
        ls.setItem(ACCOUNT_KEY, accountNumber);
        if (userData) ls.setItem(USER_DATA_KEY, JSON.stringify(userData));
      }
    }
  } catch (err) {
    console.warn("Could not save session data:", err);
  }
}

export async function getSessionData(): Promise<{ accountNumber: string | null; userData: any | null }> {
  try {
    let acc: string | null = null;
    let userStr: string | null = null;

    if (await isSecureStoreAvailable()) {
      acc = await SecureStore.getItemAsync(ACCOUNT_KEY);
      userStr = await SecureStore.getItemAsync(USER_DATA_KEY);
    } else {
      const ls = getWebLocalStorage();
      if (ls) {
        acc = ls.getItem(ACCOUNT_KEY) || memoryStore[ACCOUNT_KEY] || null;
        userStr = ls.getItem(USER_DATA_KEY) || memoryStore[USER_DATA_KEY] || null;
      } else {
        acc = memoryStore[ACCOUNT_KEY] || null;
        userStr = memoryStore[USER_DATA_KEY] || null;
      }
    }

    return {
      accountNumber: acc,
      userData: userStr ? JSON.parse(userStr) : null
    };
  } catch (err) {
    console.warn("Could not retrieve session data:", err);
    return { accountNumber: null, userData: null };
  }
}

export async function clearAllAuthSession(): Promise<void> {
  await removeAuthToken();
  try {
    if (await isSecureStoreAvailable()) {
      await SecureStore.deleteItemAsync(ACCOUNT_KEY);
      await SecureStore.deleteItemAsync(USER_DATA_KEY);
    }
    delete memoryStore[ACCOUNT_KEY];
    delete memoryStore[USER_DATA_KEY];
    const ls = getWebLocalStorage();
    if (ls) {
      ls.removeItem(ACCOUNT_KEY);
      ls.removeItem(USER_DATA_KEY);
    }
  } catch (err) {
    console.warn("Could not clear session:", err);
  }
}
