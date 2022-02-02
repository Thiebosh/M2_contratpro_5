import {Navigate, useLocation} from "react-router-dom";

import useAuth from '../../providers/AuthProvider';
import {ReactElement} from "react";

export default function RequireAuth({ element }: {element: ReactElement}) {
  const {authed} = useAuth();
  const location = useLocation();

  return authed ? element : <Navigate to="/login" state={{ path: location.pathname }}/>
}
