import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const DEV_CONFIG = {
  apiKey: 'AIzaSyCcYOvpGXxdsunyMyEfMcnErJSgqAhujec',
  authDomain: 'happy-app-dev-f90a0.firebaseapp.com',
  projectId: 'happy-app-dev-f90a0',
  storageBucket: 'happy-app-dev-f90a0.appspot.com',
  messagingSenderId: '682958061434',
  appId: '1:682958061434:web:7a574472ccf4b3aae6e0c3',
}

const PROD_CONFIG = {
  apiKey: 'AIzaSyCxQYCNHEC1AzgsswBmLYitr9QvSEj6-JM',
  authDomain: 'happy-app-prod-e2636.firebaseapp.com',
  projectId: 'happy-app-prod-e2636',
  storageBucket: 'happy-app-prod-e2636.appspot.com',
  messagingSenderId: '259857752083',
  appId: '1:259857752083:web:be0a3092e58e3bd0129fe6',
}

export const app = getApps().length
  ? getApps()[0]
  : initializeApp(import.meta.env.PROD ? PROD_CONFIG : DEV_CONFIG)

export const auth = getAuth(app)
