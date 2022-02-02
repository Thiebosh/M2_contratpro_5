import {Link, useNavigate} from "react-router-dom";

import useAuth from '../../providers/AuthProvider';

export default function() {
  const { authed, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout()
      .then(() => navigate("/"));
  };

  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
      </ul>
      {authed && (
        <button onClick={handleLogout}>
          Logout
        </button>
      )}
    </nav>
  )
}
