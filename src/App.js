import React, { useRef, useState } from "react";
import "./App.css";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/analytics";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyA16V2TgEpXG_PSQ6cpfHmNZEAQ4XEVb74",
  authDomain: "test-b639e.firebaseapp.com",
  databaseURL:
    "https://test-b639e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "test-b639e",
  storageBucket: "test-b639e.appspot.com",
  messagingSenderId: "198939848753",
  appId: "1:198939848753:web:40fe2200a1fcce4b236510",
  measurementId: "G-MDY5F53VKC",
});

const auth = firebase.auth();
const firestore = firebase.firestore();
firebase.analytics();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <div id="termynal" data-termynal>
        <ChatRoom />
      </div>
    </div>
  );
}

function SignIn() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt", "desc").limit(25);
  const [user] = useAuthState(auth);

  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });

    if (formValue.includes("logout")) return auth.signOut();
    if (formValue.includes("login")) return SignIn();

    const { uid, email } = auth.currentUser;

    const subEmail = email.split("@")[0];

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      subEmail,
    });
  };

  function OnInput(e) {
    if (e.key === "Enter") {
      sendMessage();
    }
    e.target.style.height = 0;
    e.target.style.height = e.target.scrollHeight + "px";
  }

  return (
    <>
      <main>
        {messages &&
          user ?
          messages.reverse().map((msg) => <ChatMessage key={msg.id} message={msg} />) : <HelpContent/>}

        <span ref={dummy}></span>
      </main>

      <div className="relative">
        <span data-ty="input" className="absolute" data-ty-prompt="> reply:" />
        <textarea
          value={formValue}
          id="story"
          name="story"
          rows={1}
          spellCheck="false"
          onChange={(e) => setFormValue(e.target.value)}
          onKeyUp={(e) => OnInput(e)}
          autoFocus
        />
      </div>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, subEmail } = props.message;
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <>
      <span data-ty="input" data-ty-prompt={subEmail} className={messageClass}>
        {text}
      </span>
    </>
  );
}

function HelpContent(props) {
  return (
    <>
      <span data-ty="input" data-ty-prompt="Type 'login'">
        Login with google
      </span>
      <span data-ty="input" data-ty-prompt="Type 'logout'">
        Logout :)
      </span>
    </>
  );
}

export default App;
