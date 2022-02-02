import {createContext, ReactElement, useContext, useState} from "react";

type AuthContextProps = {authed: boolean, login: () => Promise<void>, logout: () => Promise<void>}

const authContext = createContext<AuthContextProps>();

function useAuth() {
  const [authed, setAuthed] = useState(false);

  return {
    authed,
    login() {
      return new Promise<void>((res) => {
        setAuthed(true);
        res();
      });
    },
    logout() {
      return new Promise<void>((res) => {
        setAuthed(false);
        res();
      });
    }
  };
}

export function AuthProvider({ children }: {children: ReactElement}) {
  const auth = useAuth();

  return (
    <authContext.Provider value={useAuth()}>
      {children}
    </authContext.Provider>
  );
}

export default function AuthConsumer() {
  return useContext(authContext);
}
