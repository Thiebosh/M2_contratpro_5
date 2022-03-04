import User from "../../../models/user";
import { withSessionRoute } from "../../../lib/withSession";
import connectDB from "../../../middleware/mongodb";

async function accountsRoute(req, res) {
  if (req.method !== "GET") {
    res.status(404).json({ message: "Not found" });
    return;
  }

  User.find()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((error) => {
      console.error(error);
      res.status(400).json({ message: error });
    });
}

export default connectDB(withSessionRoute(accountsRoute));
