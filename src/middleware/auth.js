import jwt from "jsonwebtoken";
import userModel from "../../DB/model/User.model.js";
import { asyncHandler } from "../utils/errorHandling.js";

export const roles = {
  Admin: "Admin",
  User: "User",
  HR: "HR",
};
Object.freeze(roles);
export const auth = (roles = []) => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization?.startsWith(process.env.BEARER_KEY)) {
      return res.json({ message: "In-valid bearer key" });
    }
    const token = authorization.split(process.env.BEARER_KEY)[1];
    if (!token) {
      return res.json({ message: "In-valid token" });
    }
    const decoded = jwt.verify(token, process.env.TOKEN_SIGNATURE);
    if (!decoded?.id) {
      return res.json({ message: "In-valid token payload" });
    }
    const authUser = await userModel
      .findById(decoded.id)
      .select("userName email role");
    if (!authUser) {
      return res.json({ message: "Not register account" });
    }
    if (!roles.includes(authUser.role)) {
      return res.json({ message: "Not authorized account" });
    }
    req.user = authUser;
    return next();
  });
};
