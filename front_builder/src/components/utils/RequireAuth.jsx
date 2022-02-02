import {Navigate, useLocation} from "react-router-dom";

import useAuth from '../../providers/AuthProvider';

export default function RequireAuth({ element }) {
  const {authed} = useAuth();
  const location = useLocation();

  return authed ? element : <Navigate to="/login" state={{ path: location.pathname }}/>
}
