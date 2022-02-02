import {useLocation, useNavigate} from 'react-router-dom'
import useAuth from '../providers/AuthProvider'

export default function Login() {
  const navigate = useNavigate();
  const {login} = useAuth();
  const {state} = useLocation();

  const handleLogin = () => {
    login().then(() => {
      navigate(state?.path || "/dashboard");
    });
  };

  return (
    <div>
      <h1>Login</h1>
      <button onClick={handleLogin}>
        Log in
      </button>
    </div>
  );
};
