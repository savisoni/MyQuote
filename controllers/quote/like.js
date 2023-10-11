
const sequelize= require("../../util/database");
// const readModels = require("../../models/index");

const readModels = require("../../models/index");

const User = readModels.user;
const Quote= readModels.quote;
const Like = readModels.like;
const Comment = readModels.comment;
const Subscription = readModels.subscription;
const Collaboration = readModels.collaboration;

exports.createLike = async (req, res, next) => {
    try {
      const quoteId = req.body.quoteId;
      const userId = req.user.id;
  
      const quote = await Quote.findByPk(quoteId);
      const like = await Like.findOne({ where: { quoteId: quoteId, userId: userId } });
  console.log("like quote ========>", quote);
      if (!quote) {
        const error = new Error("Quote not found");
        error.statusCode = 404;
        throw error;
      }
  
      if (!like) {

        const likeCreate = await Like.create({ userId, quoteId, isLiked: true });
        return res.status(201).json({ message: "Success", like: likeCreate });
      }
  
        await like.update({ isLiked: !like.isLiked });
        return res.status(200).json({ message: "Success", like });
  
    } catch (error) {
      next(error);
    }
  };
  