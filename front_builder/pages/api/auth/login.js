import { withSessionRoute } from "../../../lib/withSession";

export default withSessionRoute(loginRoute);

async function loginRoute(req, res) {
  // get user from database then:
  if (req.method !== "POST") {
    res.status(404).json({ message: "Not found" });
    return;
  }

  const { username, password } = req.body;

  if (username === "test" && password === "test") {
    req.session.user = {
      id: 1,
      admin: true,
    };
    await req.session.save();
    res.status(200).json({ message: "logged in" });
  } else {
    res.status(403).json({ message: "Wrong credentials" });
  }
}
