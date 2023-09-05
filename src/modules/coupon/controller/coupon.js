import { StatusCodes } from "http-status-codes";
import couponModel from "../../../../DB/model/Coupon.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { ErrorClass } from "../../../utils/errorClass.js";





export const createCoupon = asyncHandler(async(req,res,next)=>{
      const { code, amount, expireDate, numOfUses } = req.body;
     const createdBy = req.user._id;
      const isCodeExist = await couponModel.findOne({code})
      if (isCodeExist) {
            return next(new ErrorClass(`${code} coupon is already exist `))
      }
      const coupon = await couponModel.create({
        code,
        amount,
        expireDate,
        numOfUses,
        createdBy,
      });
      return res.status(StatusCodes.CREATED).json({message :"done" , coupon})
})