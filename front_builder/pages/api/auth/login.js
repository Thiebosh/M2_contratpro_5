import { withSessionRoute } from "../../../lib/withSession";
import connectDB from "../../../middleware/mongodb";
import User from "../../../models/user";
import bcrypt from "bcryptjs";

async function loginRoute(req, res) {
  // get user from database then:
  if (req.method !== "POST") {
    res.status(404).json({ message: "Not found" });
    return;
  }

  const { username, password } = req.body;

  User.findOne({ name: username })
    .then(async (user) => {
      if (user) {
        if (bcrypt.compareSync(password, user.password)) {
          // id: 61e131ce9c11b699edc38a1e
          req.session.user = {
            id: user.id,
          };
          await req.session.save();
          res.status(200).json({ message: "logged in" });
          return;
        }
      }

      res.status(403).json({ message: "Wrong credentials" });
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({ message: error });
    });
}

export default connectDB(withSessionRoute(loginRoute));
