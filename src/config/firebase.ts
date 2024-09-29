// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
} from '@env';

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

// Define AllergenProfile type without sensitivity
export interface AllergenProfile {
  [key: string]: {
    selected: boolean;
  };
}

export const signInWithGoogleCredential = async (idToken: string) => {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    await signInWithCredential(auth, credential);
  } catch (error) {
    console.error('Error signing in with Google', error);
    throw error;
  }
};

export const signInWithEmailAndPassword = async (email: string, password: string) => {
  try {
    await firebaseSignInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error signing in with email and password', error);
    throw error;
  }
};

export const createUserWithEmailAndPassword = async (email: string, password: string) => {
  try {
    await firebaseCreateUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error creating user with email and password', error);
    throw error;
  }
};

export const signOut = () => {
  return firebaseSignOut(auth);
};

export const getUserAllergens = async (): Promise<AllergenProfile> => {
  if (!auth.currentUser) {
    throw new Error('No user is signed in');
  }
  const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
  return userDoc.data()?.allergens || {};
};

export const updateUserAllergens = async (allergens: AllergenProfile) => {
  if (!auth.currentUser) {
    throw new Error('No user is signed in');
  }
  try {
    await updateDoc(doc(db, 'users', auth.currentUser.uid), { allergens });
  } catch (error) {
    console.error('Error updating allergens:', error);
    throw error; // Re-throw the error if you want to handle it elsewhere
  }
};

export { auth, db };
export default app;
