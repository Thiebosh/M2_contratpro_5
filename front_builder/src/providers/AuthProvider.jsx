import {createContext, useContext, useState} from "react";

const AuthContext = createContext();

function useAuth() {
  const [authed, setAuthed] = useState(localStorage.getItem('authed') || false);


  // User Login info
  const database = [
    {
      username: "ben",
      password: "ben"
    },
  ];

  return {
    authed,
    login(username, password) {
      return new Promise((res) => {
        // Find user login info
        const userData = database.find((user) => user.username === username);

        // Compare user info
        if (userData) {
          if (userData.password !== password) {
            // Invalid password
            res(false, 'Incorrect password');
          } else {
            localStorage.setItem('authed', 'true');
            setAuthed(true);
            res(true)
          }
        } else {
          // Username not found
          res(false, 'Incorrect username');
        }
      });
    },
    logout() {
      return new Promise((res) => {
        setAuthed(false);
        res();
      });
    }
  };
}

export function AuthProvider({ children }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export default function AuthConsumer() {
  return useContext(AuthContext);
}
