declare const process: any;

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export const getFirebaseConfig = (): FirebaseConfig => {
  const env = typeof process !== 'undefined' ? process.env || {} : {};
  return {
    apiKey: env.FIREBASE_API_KEY || env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDbdgblttxxeiuGjd4Lk-aAcEF1HCo86_4',
    authDomain: env.FIREBASE_AUTH_DOMAIN || 'gotechplace-e91bc.firebaseapp.com',
    projectId: env.FIREBASE_PROJECT_ID || 'gotechplace-e91bc',
    storageBucket: env.FIREBASE_STORAGE_BUCKET || 'gotechplace-e91bc.firebasestorage.app',
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID || '227037159117',
    appId: env.FIREBASE_APP_ID || '1:227037159117:android:893551bf4a9d39aa125384',
    measurementId: 'G-ET7T167RGN',
  };
};
