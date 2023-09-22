const Like = require("../models/like");
const Quote= require("../models/quote")


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
        return next(error);
      }
  
      if (!like && quote.isDeleted==false) {

        const likeCreate = await Like.create({ userId, quoteId, isLiked: true });
        return res.status(201).json({ message: "Success", like: likeCreate });
      }
  
      if (like) {
        await like.update({ isLiked: !like.isLiked });
        return res.status(200).json({ message: "Success", like });
      } else {
        return res.status(404).json({ message: "Like not found" });
      }
  
    } catch (error) {
      return res.status(error.statusCode || 500).json({ message: error.message });
    }
  };
  