import {Link} from "react-router-dom";

export default function NotFound() {
  return (
    <div>
      <h1>404: Not Found</h1>
      <p>This page has gone</p>
      <Link to={'/'}>Go back Home &rsaquo;</Link>
    </div>
  )
}
