import { Schema, Types, model } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      min: [2, "minimum length 2 char"],
      max: [20, "max length 2 char"],
    },
    email: {
      type: String,
      unique: [true, "email must be unique value"],
      required: [true, "userName is required"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      default: "Admin",
      enum: ["User", "Admin"],
    },
    confirmEmail: {
      type: Boolean,
      default: false,
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    image: { type: Object },
    DOB: Date,
    code: {
      type: String,
      min: [6, "length must be 6 "],
      max: [6, "length must be 6 "],
    },
    favorites: [
      {
        type: Types.ObjectId,
        ref: "product",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const userModel = model("User", userSchema);
export default userModel;
