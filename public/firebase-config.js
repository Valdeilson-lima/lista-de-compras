// Substitua estas configurações pelas do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCbsbuet8Ni1H9CR9nM_YnzX9SKC4dtpcg",
  authDomain: "listadecompras-7cea6.firebaseapp.com",
  projectId: "listadecompras-7cea6",
  storageBucket: "listadecompras-7cea6.firebasestorage.app",
  messagingSenderId: "831178085080",
  appId: "1:831178085080:web:124d03f0d911058e913dad",
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

console.log("Firebase inicializado:", {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  authReady: !!auth,
});

// Aguardar Firebase estar pronto
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch((error) => {
  console.error("Erro ao configurar persistência:", error);
});
