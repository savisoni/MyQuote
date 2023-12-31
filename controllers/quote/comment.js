

const sequelize= require("../../util/database");
const readModels = require("../../models/index");

const User = readModels.user;
const Quote= readModels.quote;
const Like = readModels.like;
const Comment = readModels.comment;
const Subscription = readModels.subscription;
const Collaboration = readModels.collaboration;
const {validationResult}= require("express-validator")

exports.createComment = async(req,res,next)=>{
   try {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json({ errors: errors.array() });
    }
     const {comment,quoteId}=req.body;
     const userId=req.user.id;

     const quote = await Quote.findByPk(quoteId);
     if (! quote) {
        const error = new Error("No quote found with this id");
        error.statusCode = 401;
        throw error;
      }
     
     
     const commentData = await Comment.create({
        comment:comment,
        quoteId:quoteId,
        userId:userId
     });
    return res.status(201).json({ message: "success", commentData:commentData });



   } catch (error) {
      next(error)
   }
}


exports.deleteComment = async (req, res, next) => {
   try {
     const commentId = req.params.commentId;
 
     const commentData = await Comment.findByPk(commentId);
 
     if (!commentData) {
       const error = new Error("No comment found with this id");
       error.statusCode = 401;
       throw error;
     }
 
     const quoteId = commentData.quoteId;
     const quoteData = await Quote.findByPk(quoteId);
 
     if (!quoteData) {
       const error = new Error("No quote found for this comment");
       error.statusCode = 401;
       throw error;
     }
 
     const userId = quoteData.userId;
 
     if (commentData.userId !== req.user.id && commentData.userId !== userId) {
       const error = new Error("Not authorized");
       error.statusCode = 401;
       throw error;
     }
 
     await commentData.destroy();
 
     return res.status(200).json({ message: "Comment deleted successfully" });
   } catch (error) {
    next(error);
   }
 };
 