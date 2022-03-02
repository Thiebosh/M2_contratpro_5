import { withSessionRoute } from "../../../lib/withSession";

export default withSessionRoute(logoutRoute);

async function logoutRoute(req, res) {
  // get user from database then:
  delete req.session.user;
  await req.session.save();
  res.status(200).json({ message: "logged out" });
}
