const readModels = require("../../models/index");

const User = readModels.user;
const MsgRequest = readModels.msgrequest;
const Chat = readModels.chats;
const SubscriptionsDetail = readModels.subscriptiondetails;
const Subscription = require("../../models/subscription");
const { Op } = require("sequelize");

const { getIo } = require("../../socket");

exports.getChatForm = async (req, res, next) => {
  try {
    const cookie = req.cookies;
    const currentUser = req.user;

    console.log(
      "Authenticated User:----------------------------------********************",
      currentUser.dataValues.username
    );
    let plan;
    const subscription_details = await SubscriptionsDetail.findOne({
      where: { userId: currentUser.dataValues.id },
    });
    console.log("Subs det======", subscription_details);
    if (!subscription_details) {
      plan = await Subscription.findOne({ where: { name: "basic" } });
    } else {
      plan = await Subscription.findOne({
        where: { id: subscription_details.subscriptionId },
      });
    }
    console.log("plan====", plan);

    if (plan == "basic") {
      return res.json({
        message: "You need to buy subscription for sending message",
      });
    }
    const users = await User.findAll();
    console.log("users-----------------", users);
    res.render("chat-form", {
      users: users,
      currentUser: currentUser,
      plan: plan,
    });
  } catch (error) {
    next(error);
  }
};
