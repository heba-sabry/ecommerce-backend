import { roles } from "../../middleware/auth.js";

export const endPoint = {
  categoryCrud: [roles.Admin],
};
