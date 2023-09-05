import { StatusCodes } from "http-status-codes";
import couponModel from "../../../../DB/model/Coupon.model.js";
import { ErrorClass } from "../../../utils/errorClass.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import orderModel from "../../../../DB/model/Order.model.js";
import productModel from "../../../../DB/model/product.model.js";
import cartModel from "../../../../DB/model/Cart.model.js";
import Stripe from "stripe";
import { createInvoice } from "../../../utils/createinvoice.js";
import path from "path";
import fs from "fs"
import { fileURLToPath } from "url";
import sendEmail, { createHtml } from "../../../utils/email.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const stripe = new Stripe(process.env.STRIPE_KYE);

//create order
export const createOrder = asyncHandler(async (req, res, next) => {
  let { products, address, phone, coupon, paymentMethod, note } = req.body;
  const cart = await cartModel.findOne({ userId: req.user._id });
  if (!products) {
    products = cart.products;
    if (!products.length) {
      return next(new ErrorClass("cart is empty", StatusCodes.NOT_FOUND));
    }
  }
  //check coupon details
  if (coupon) {
    const isCouponExist = await couponModel.findOne({ code: coupon });
    if (!isCouponExist) {
      return next(new ErrorClass("coupon is not found", StatusCodes.NOT_FOUND));
    }
    if (
      isCouponExist.expireDate < Date.now() ||
      isCouponExist.numOfUses <= isCouponExist.usedBy.length
    ) {
      return next(new ErrorClass(" coupon is expire", StatusCodes.FORBIDDEN));
    }
    if (isCouponExist.usedBy.includes(req.user._id)) {
      return next(
        new ErrorClass("can not use this coupon again", StatusCodes.BAD_REQUEST)
      );
    }
    // console.log(isCouponExist); ==>// totat coupon
    // console.log(req.body.coupon);==>//code only
    req.body.coupon = isCouponExist;
  }
  const existedProduct = [],
    arrayFromStock = [],
    foundIdProducts = [];
  let price = 0;
  //check product details
  for (const product of products) {
    const isProductExist = await productModel.findById(product.product);
    if (!isProductExist) {
      return next(
        new ErrorClass("product is not found", StatusCodes.NOT_FOUND)
      );
    }
    if (isProductExist.stock < product.quantity) {
      return next(new ErrorClass("out of stock", StatusCodes.NOT_FOUND));
    }
    existedProduct.push({
      product: {
        name: isProductExist.name,
        price: isProductExist.price,
        paymentPrice: isProductExist.paymentPrice,
        productId: isProductExist._id,
      },
      quantity: product.quantity,
    });
    price += isProductExist.paymentPrice * product.quantity;
    foundIdProducts.push(isProductExist._id);
    arrayFromStock.push({
      product: isProductExist,
      quantity: product.quantity,
    });
  }
  for (const product of arrayFromStock) {
    product.product.stock = product.product.stock - product.quantity;
    await product.product.save();
  }
  //delete product in cart
  //option 1 if use product from body
  if (req.body.products) {
    await cartModel.updateOne(
      { userId: req.user._id },
      {
        $pull: {
          products: {
            product: {
              $in: foundIdProducts,
            },
          },
        },
      }
    );
    //option 2 if use product from cart
  } else {
    await cartModel.updateOne({ userId: req.user._id }, { products: [] });
  }
  const paymentPrice = price - price * ((req.body.coupon?.amount || 0) / 100);
  const order = await orderModel.create({
    userId: req.user._id,
    address,
    phone,
    note,
    products: existedProduct,
    price,
    couponId: req.body.coupon?._id,
    paymentPrice,
    paymentMethod,
    status: paymentMethod == "card" ? "waitPayment" : "placed",
  });
  if (paymentMethod == "card") {
    if (req.body.coupon) {
      const coupon = await stripe.coupons.create({
        percent_off: req.body.coupon.amount,
        duration: "once",
      });
      req.body.StripeCoupon = coupon.id;
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: req.user.email,
      metadata: {
        orderId: order._id.toString(),
      },
      cancel_url: process.env.cancel_url,
      success_url: process.env.success_url,
      discounts: req.body.StripeCoupon
        ? [{ coupon: req.body.StripeCoupon }]
        : [],
      line_items: existedProduct.map((product) => {
        return {
          price_data: {
            currency: "EGP",
            product_data: {
              name: product.product.name,
            },
            unit_amount: product.product.paymentPrice * 100,
          },
          quantity: product.quantity,
        };
      }),
    });
    //create pdf
    const invoice = {
      shipping: {
        email: req.user.email,
        paymentPrice,
        name: req.user.name,
        address,
      },
      items: existedProduct.map((product) => {
        return {
          item: product.product.name,
          quantity: product.quantity,
          amount: product.product.paymentPrice,
        };
      }),
      price,
    };
    createInvoice(invoice, filePath);
    let filePath = path.join(
      __dirname,
      `../../../utils/pdf/${req.user.email}.pdf`
    );
    await await sendEmail(
      req.user.email,
      "order invoice",
      createHtml("your order invoice"),
      [
        {
          filename: "order invoice",
          path: filePath,
          contentType: "application/pdf",
        },
      ]
    );
    fs.unLinkSync(filePath)
    //push userId whene use coupon
    if (req.body.coupon) {
      await couponModel.updateOne(
        { code: req.body.coupon.code },
        {
          $addToSet: {
            usedBy: req.user._id,
          },
        }
      );
    }
    return res
      .status(StatusCodes.CREATED)
      .json({ message: "done", order, session });
  }

  return res.status(StatusCodes.CREATED).json({ message: "done", order });
});

//cancel order
export const cancelOrder = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;
  const { id } = req.params;
  const order = await orderModel.findOne({ _id: id, userId: req.user._id });
  if (!order) {
    return next(new ErrorClass("order not found", StatusCodes.NOT_FOUND));
  }
  if (
    (order?.paymentMethod == "cash" && order?.status != "placed") ||
    (order?.paymentMethod == "card" && order?.status != "waitPayment")
  ) {
    return next(
      new ErrorClass(
        `can not cancel your order after it been change to ${order.status}`,
        StatusCodes.CONFLICT
      )
    );
  }
  const cancelOrder = await orderModel.updateOne(
    { _id: order._id },
    { status: "canceled", reason, updatedBy: req.user._id }
  );
  if (!cancelOrder.matchedCount) {
    return next(
      new ErrorClass(`fail cancel your order `, StatusCodes.CONFLICT)
    );
  }
  for (const product of order.products) {
    await productModel.findByIdAndUpdate(
      { _id: product.product.productId },
      { $inc: { stock: product.quantity } }
    );
  }
  if (order.couponId) {
    await couponModel.updateOne(
      { _id: order.couponId },
      {
        $pull: {
          usedBy: req.user._id,
        },
      }
    );
  }
  return res.status(StatusCodes.CREATED).json({ message: "done" });
});

//handel status whene payment = card
export const webHook = asyncHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.endpointSecret
    );
  } catch (err) {
    return next(
      new ErrorClass(`Webhook Error: ${err.message}`, StatusCodes.BAD_REQUEST)
    );
  }
  if (event.type != "checkout.session.completed") {
    await orderModel.updateOne(
      { _id: event.data.object.metadata.orderId },
      {
        status: "rejected",
      }
    );
    return next(new ErrorClass(`in-valid payment`, StatusCodes.BAD_REQUEST));
  } else {
    const order = await orderModel.updateOne(
      { _id: event.data.object.metadata.orderId },
      {
        status: "placed",
      }
    );
    return res.status(StatusCodes.CREATED).json({ message: "done", order });
  }
});
