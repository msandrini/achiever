const API_AUTH_TOKEN = 'achiever-auth-token';

export const setAuthToken = token => localStorage.setItem(API_AUTH_TOKEN, token);

export const getAuthToken = () => localStorage.getItem(API_AUTH_TOKEN);

export const removeAuthToken = () => localStorage.removeItem(API_AUTH_TOKEN);
