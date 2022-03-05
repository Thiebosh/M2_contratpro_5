import { withSessionRoute } from "../../../lib/withSession";
import requireAuth from "../../../middleware/requireAuth";

export default withSessionRoute(logoutRoute);

async function logoutRoute(req, res) {
  await req.session.destroy();
  res.status(200).json({ message: "logged out" });
}

export const getServerSideProps = requireAuth;
