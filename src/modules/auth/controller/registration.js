import { StatusCodes } from "http-status-codes";
import userModel from "../../../../DB/model/User.model.js";
import { ErrorClass } from "../../../utils/errorClass.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import CryptoJS from "crypto-js";
import { compare, hash } from "../../../utils/HashAndCompare.js";
import cloudinary from "../../../utils/cloudinary.js";
import sendEmail, { createHtml } from "../../../utils/email.js";
import { nanoid } from "nanoid";
import { generateToken } from "../../../utils/GenerateAndVerifyToken.js";
import cartModel from "../../../../DB/model/Cart.model.js";

export const signUp = asyncHandler(async (req, res, next) => {
  const isEmailExist = await userModel.findOne({ email: req.body.email });
  if (isEmailExist) {
    return next(
      new ErrorClass(`${req.body.email} is already exist`, StatusCodes.CONFLICT)
    );
  }
  req.body.phone = CryptoJS.AES.encrypt(
    req.body.phone,
    process.env.ENCRYPTION_KEY
  ).toString();
  req.body.password = hash(req.body.password);
  if (req.file) {
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: "e_commerce/user" }
    );
    req.body.image = { public_id, secure_url };
  }
  const code = nanoid(6);
  const html = createHtml(code);
  sendEmail({ to: req.body.email, subject: `confirm email`, html });
  req.body.code = code;
  const user = await userModel.create(req.body);
  await cartModel.create({ userId: user._id });
  return res.status(StatusCodes.CREATED).json({ massage: "done", user });
});
export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { email, code } = req.body;
  const isEmailExist = await userModel.findOne({ email: req.body.email });
  if (!isEmailExist) {
    return next(new ErrorClass(`${email} is not found`, StatusCodes.NOT_FOUND));
  }
  if (code != isEmailExist.code) {
    return next(new ErrorClass(`in_valid code`, StatusCodes.BAD_REQUEST));
  }
  const newCode = nanoid(6);

  const confirmedUser = await userModel.updateOne(
    { email },
    { confirmEmail: true, code: newCode }
  );
  return res.status(StatusCodes.OK).json({ massage: "done", confirmedUser });
});
export const signIn = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return next(
      new ErrorClass(`in valid user information`, StatusCodes.NOT_ACCEPTABLE)
    );
  }
  const match = compare(password, user.password);
  if (!match) {
    return next(
      new ErrorClass(`in valid user information`, StatusCodes.NOT_ACCEPTABLE)
    );
  }
  const payload = {
    id: user._id,
    email: user.email,
  };
  const token = generateToken({ payload });
  return res.status(StatusCodes.ACCEPTED).json({ massage: "done", token });
});
//steep forget password
//1-send code
export const sendCode = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const isEmailExist = await userModel.findOne({ email });
  if (!isEmailExist) {
    return next(new ErrorClass(`${email} not found`, StatusCodes.NOT_FOUND));
  }
  const code = nanoid(6);
  const html = createHtml(code);
  sendEmail({ to: email, subject: `forget password`, html });
  await userModel.updateOne({ email }, { code });
  return res.status(StatusCodes.ACCEPTED).json({ massage: "done" });
});
//2-reset password
export const resetPass = asyncHandler(async (req, res, next) => {
  let { email, code, password } = req.body;
  const isEmailExist = await userModel.findOne({ email });
  if (!isEmailExist) {
    return next(new ErrorClass(`${email} not found`, StatusCodes.NOT_FOUND));
  }
  if (code != isEmailExist.code) {
    return next(new ErrorClass(`in_valid code`, StatusCodes.BAD_REQUEST));
  }
  password = hash(password);
  const newCode = nanoid(6);
  await userModel.updateOne({ email }, { password, code: newCode });
  return res.status(StatusCodes.ACCEPTED).json({ massage: "done" });
});
