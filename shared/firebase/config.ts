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
    apiKey: env.FIREBASE_API_KEY || env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDemoKeyTech2Place2026SecureProd',
    authDomain: env.FIREBASE_AUTH_DOMAIN || 'tech2place-prod.firebaseapp.com',
    projectId: env.FIREBASE_PROJECT_ID || 'tech2place-prod',
    storageBucket: env.FIREBASE_STORAGE_BUCKET || 'tech2place-prod.appspot.com',
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID || '102938475610',
    appId: env.FIREBASE_APP_ID || '1:102938475610:android:abcdef0123456789',
  };
};
