import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/storage'


const firebaseConfig = {
  apiKey: "AIzaSyCdZK1dc8GtbHzvXfTxMJ0XeERiMj_Prs0",
  authDomain: "instaa-gram.firebaseapp.com",
  projectId: "instaa-gram",
  storageBucket: "instaa-gram.appspot.com",
  messagingSenderId: "710080663677",
  appId: "1:710080663677:web:e2cb238abfd6df032ba114"
};

firebase.initializeApp(firebaseConfig)

const database = firebase.firestore()
 const projectAuth = firebase.auth()
 const projectStorage = firebase.storage()
 const timestamp = firebase.firestore.FieldValue.serverTimestamp

 export {database,projectAuth,timestamp,projectStorage}







