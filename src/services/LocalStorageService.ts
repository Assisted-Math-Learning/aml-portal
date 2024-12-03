import { decodeToken } from 'react-jwt';
import { DecodedToken } from '../types/interfaces';

export const AUTH_TOKEN = 'auth_token';
export const PREV_LINK = 'prev_link';
export const CSRF_TOKEN = 'csrf-token';

export const CONTENT_LANG = 'content_lang';

export class LocalStorageService {
  private static _instance: LocalStorageService;

  static getInstance(): LocalStorageService {
    if (!this._instance) {
      this._instance = new LocalStorageService();
    }

    return this._instance;
  }

  setLocalStorageValue(key: string, value: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage?.setItem(key, value);
    }
  }

  getLocalStorageValue(key: string): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage?.getItem(key);
    }
    return null;
  }

  removeLocalStorageValue(key: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage?.removeItem(key);
    }
  }

  setSessionStorageValue(key: string, value: string): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage?.setItem(key, value);
    }
  }

  getSessionStorageValue(key: string): string | null {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage?.getItem(key);
    }
    return null;
  }

  removeSessionStorageValue(key: string): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage?.removeItem(key);
    }
  }

  setAuthToken(token: string): void {
    this.setLocalStorageValue(AUTH_TOKEN, token);
  }

  setCSRFToken(token: string): void {
    this.setLocalStorageValue(CSRF_TOKEN, token);
  }

  getAuthToken(): string | null {
    return this.getLocalStorageValue(AUTH_TOKEN);
  }

  getCSRFToken(): string | null {
    return this.getLocalStorageValue(CSRF_TOKEN);
  }

  removeAuthToken(): void {
    this.removeLocalStorageValue(AUTH_TOKEN);
  }

  removeCSRFToken(): void {
    this.removeLocalStorageValue(CSRF_TOKEN);
  }

  getTokenExpiry() {
    const userToken = localStorage?.getItem(AUTH_TOKEN);
    if (userToken) {
      const decodedToken: DecodedToken = decodeToken(userToken)!;
      if (decodedToken && decodedToken.exp) {
        const expirationTimestamp = decodedToken.exp;

        return new Date(expirationTimestamp * 1000);
      }
    }

    return null;
  }

  saveLearnerResponseData(learnerId: string, newData: any[]) {
    try {
      // Get the existing data from localStorage
      const existingData = this.getLearnerResponseData(learnerId) || [];
      // Create a map to track the latest response for each questionId
      const responseMap = new Map();
      // Add existing responses to the map (ensuring no duplicates yet)
      existingData.forEach((response: any) => {
        responseMap.set(response.question_id, response);
      });
      // Iterate over the new data and update the map with the latest responses
      newData.forEach((response: any) => {
        responseMap.set(response.question_id, response); // Update or add new response
      });
      // Convert the map back to an array and save it in localStorage
      const mergedData = Array.from(responseMap.values());
      localStorage.setItem(learnerId, JSON.stringify(mergedData));
    } catch (error) {
      console.error('Error saving data to LocalStorage:', error);
    }
  }

  getLearnerResponseData(learnerId: string) {
    try {
      const storedData = localStorage.getItem(learnerId);
      return storedData ? JSON.parse(storedData) : null;
    } catch (error) {
      console.error('Error getting data from LocalStorage:', error);
      return null;
    }
  }

  deleteLearnerResponseData(learnerId: string) {
    try {
      localStorage.removeItem(learnerId);
    } catch (error) {
      console.error('Error removing data from LocalStorage:', error);
    }
  }

  clearAll() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing LocalStorage:', error);
    }
  }
}

export const localStorageService = LocalStorageService.getInstance();
