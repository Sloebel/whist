import firebase from 'firebase'

// Initialize Firebase
const config = {
    apiKey: "AIzaSyCuFeD-S6aBiRCewbczDjxIBahOKONSepU",
    authDomain: "whist-83fed.firebaseapp.com",
    databaseURL: "https://whist-83fed.firebaseio.com",
    projectId: "whist-83fed",
    storageBucket: "whist-83fed.appspot.com",
    messagingSenderId: "646698326394"
};
const fire = firebase.initializeApp(config);

export default fire;