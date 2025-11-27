// types/firebase.d.ts
declare module '@firebase/firebaseConfig' {
  import { Firestore } from 'firebase/firestore';
  import { Storage } from 'firebase/storage';
  import { Auth } from 'firebase/auth';

  export const db: Firestore;
  export const storage: Storage;
  export const auth: Auth;
  export const googleProvider: any;
}
