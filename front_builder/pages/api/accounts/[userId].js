import User from "../../../models/user";
import { withSessionRoute } from "../../../lib/withSession";
import connectDB from "../../../middleware/mongodb";

async function accountRoute(req, res) {
  if (req.method !== "GET") {
    res.status(404).json({ message: "Not found" });
    return;
  }

  User.findOne({ _id: req.query.userId })
    .then((user) => {
      res.status(200).json(user);
    })
    .catch((error) => {
      console.error(error);
      res.status(400).json({ message: error });
    });
}

export default connectDB(withSessionRoute(accountRoute));
