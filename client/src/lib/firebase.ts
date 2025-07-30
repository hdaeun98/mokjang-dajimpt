// Firebase configuration and utilities
// Note: This is set up for future Firebase integration
// For now, we'll use the backend API

export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,  
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// src/firebase-config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// For now, we'll use the Express API backend
// This file is prepared for future Firebase integration
export const isFirebaseConfigured = () => {
  return Object.values(FIREBASE_CONFIG).every(value => value !== "");
};
