import firebase from 'firebase/app';
import 'firebase/database';

// Initialize Firebase
const config = {
    apiKey: "AIzaSyCBrRBBfQTCAF5rqj_A8fXN4jMZlZ310RM",
    authDomain: "whist-d4d9b.firebaseapp.com",
    databaseURL: "https://whist-d4d9b.firebaseio.com",
    projectId: "whist-d4d9b",
    storageBucket: "",
    messagingSenderId: "630677405872"
};
const fire = firebase.initializeApp(config);

export default fire;