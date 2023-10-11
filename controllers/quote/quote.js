// const Quote = require("../../models/quote");
const { validationResult } = require("express-validator");
const Sequelize = require("sequelize");
const { Op, Model } = require("sequelize");
// const Like = require("../../models/like");
// const User = require("../../models/user");
// const Comment = require("../../models/comment");
// const Subscription = require("../../models/subscription");
// const Collaboration = require("../../models/collaboration");

const sequelize= require("../../util/database");
const readModels = require("../../models/index");
const User = readModels.user;
const Quote= readModels.quote;
const Like = readModels.like;
const Comment = readModels.comment;
const Subscription = readModels.subscription;
const Collaboration = readModels.collaboration;
exports.getQuotes = async (req, res, next) => {
  try {
    const {
      sortBy,
      sortOrder,
      searchField,
      searchKey,
      filterField,
      filterValue,
    } = req.query;
    const page = +req.query.page||1;
    const quoteId = req.params.quoteId;
    console.log(quoteId);
    let test = [];

    if (quoteId) {
      const quotedata = await Quote.findByPk(quoteId);
      if (!quotedata) {
        const error = new Error("No quote found with this id");
        error.statusCode = 204;

        throw error;
      }
      //find likes
      const quote = await Quote.findByPk(quoteId, {
        include: [{ model: Like, where: { isLiked: true } }],
      });
      console.log("quote--------->", quote);

      //find comments
      const comments = await Quote.findByPk(quoteId, { include: Comment });

      console.log("======", comments);

      const noOfLikes = quote?.likes?.length || 0;
      const noOfComments = comments?.comments?.length || 0;
      return res
        .status(200)
        .json({ noOfLikes: noOfLikes, noOfComments: noOfComments });
    }

    // console.log("quote data=====>", quote);

    const options = { where: {}, order: [] };

    //sorting
    if (sortBy && sortOrder) {
      // sortObj = {[sortBy]:sortOrder}
      // test = Object.entries(sortObj)
      test.push(sortBy);
      test.push(sortOrder);
      options.order = [test];
      console.log(options);
    }

    //searching
    // const searchObj ={}
    if (searchField && searchKey) {
      options.where[searchField] = { [Op.like]: `%${searchKey}%` };
      // options.where = {...searchObj}
      // console.log();
    }

    // const filterObj ={}

    if (filterField && filterValue) {
      options.where[filterField] = { [Op.eq]: filterValue };
      console.log(filterObj);
    }


    //pagination
    const pageItems = 2;
    const offset= (page-1)*pageItems;
    const limit = pageItems;
    options.offset=offset;
    options.limit=limit;

    //  options ={where:{...searchObj, ...filterObj}};
    console.log(options);

    const quotes = await Quote.findAll(options);
    if (quotes.length === 0) {
      
      return res.status(404).json({ message: "No quotes found" });
    }

    return res.status(200).json({ quotes: quotes });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createQuote = async (req, res, next) => {
  try {
    //count monthly quote creation
    const user = req.user;
    const currentDate = new Date();
    // const currentMonth = currentDate.getMonth();

    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const monthlyQuoteCount = await Quote.count({
      where: {
        userId: user.id,
        createdAt: {
          [Sequelize.Op.between]: [firstDayOfMonth, lastDayOfMonth],
        },
      },
    });

    console.log("monthly quote count==>", monthlyQuoteCount);
    const { title, content, collaborationMode } = req.body;
    // console.log("user data====>", user);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json({ errors: errors.array() });
    }

    if (!user) {
      const error = new Error("No user found with this id");
      error.statusCode = 204;

      throw error;
    }

    const subscription = await Subscription.findByPk(user.subscriptionId);
    // console.log("subscription data ====>", subscription);
    const quotesCreated = await User.findByPk(user.id, { include: Quote });
    // console.log("quotes numbers==>" ,quotesCreated.quotes.length);

    if (!subscription) {
      const error = new Error("No Subscription found");
      error.statusCode = 204;

      throw error;
    }
    switch (subscription.name) {
      case "basic":
        if (quotesCreated.quotes.length > subscription.maxQuotes) {
          return res
            .status(403)
            .json({ message: "basic subscription limit has been reached" });
        }
        break;
      case "standard":
        if (monthlyQuoteCount > subscription.maxQuotes) {
          return res
            .status(403)
            .json({ message: "standard subscription limit has been reached" });
        }
        break;
      case "premium":
        if (monthlyQuoteCount > subscription.maxQuotes) {
          return res
            .status(403)
            .json({ message: "premium subscription limit has been reached" });
        }
        break;
      default:
        return res.status(400).json({ message: "Unknown user role" });
    }

    const quote = await Quote.create({
      title: title,
      content: content,
      userId: req.user.id,
      collaborationMode: collaborationMode,
    });
    return res.status(201).json({ message: "success", quote: quote });
  } catch (error) {
    next(error)
  }
};

exports.updateQuote = async (req, res, next) => {
  try {
    const quoteId = req.params.quoteId;
    const { title, content } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json({ errors: errors.array() });
    }
    const quote = await Quote.findByPk(quoteId);

    if (!quote) {
      const error = new Error("No quote found with this id");
      error.statusCode = 200;

      throw error;
    }

    if (quote.userId !== req.user.id) {
      const error = new Error("Not Authorized");
      error.statusCode = 401;
      throw error;
    }
    if (quote.status !== "draft") {
      const error = new Error("Quote cannot be updated");
      error.statusCode = 403;
      throw error;
    }

    quote.title = title;
    quote.content = content;
    await quote.save();
    return res.json({ message: "updated successfully", quote: quote });
  } catch (error) {
    // return res.status(500).json({ message: error.message });
    next(error);
  }
};

exports.deleteQuote = async (req, res, next) => {
  try {
    const quoteId = req.params.quoteId;
    const quoteToDelete = await Quote.findByPk(quoteId, { include: Like });

    if (!quoteToDelete) {
      const error = new Error("No quote found with this id");
      error.statusCode = 204;
      throw error;
    }
    // console.log("------>", quoteToDelete.userId);
    // console.log("------>", req.user.id);
    if (quoteToDelete.userId !== req.user.id) {
      const error = new Error("Not authorized");
      error.statusCode = 401;
      throw error;
    }
    // quoteToDelete.isDeleted = true;
    // await quoteToDelete.save();

    //  for (const like of quoteToDelete.likes) {
    //       await like.destroy();
    //     }
    // await Quote.findAll({
    //   where: { isDeleted:true },
    //   paranoid: false
    // });
    Quote.afterDestroy(async (instance, options) => {
      console.log("instance", instance);
      await Like.destroy({ where: { quoteId: instance.id } });
      await Comment.destroy({ where: { quoteId: instance.id } });
      await Collaboration.destroy({ where: { quoteId: instance.id } });
    });

    quoteToDelete.destroy();

    return res.json({
      message: "quote deleted successfully",
      quote: quoteToDelete,
    });
  } catch (error) {
      next(error)
  }
};

exports.collaborationCreateUpdate = async (req, res, next) => {
  try {
    const { quoteId, addText, collaborationId } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    const quote = await Quote.findByPk(quoteId);
    console.log("quote===>", quote);

    if (!quote || !user) {
          const error = new Error("Quote or User not found");
      error.statusCode = 204;

      throw error;
    }

    if (userId === quote.userId) {
      const error = new Error("Owner cannot collaborate to his/her own quotes");
      error.statusCode = 401;

      throw error;    

    }
    const subscription = await Subscription.findByPk(user.subscriptionId);

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.statusCode = 204;

      throw error;    

    }

    const startOfCurrentDay = new Date();
    startOfCurrentDay.setHours(0, 0, 0, 0);

    const collaborationsToday = await Collaboration.count({
      where: {
        userId: userId,
        createdAt: {
          [Op.gte]: startOfCurrentDay,
        },
      },
    });

    if (collaborationsToday >= subscription.maxCollaborationPerDay) {
      return res
        .status(403)
        .json({
          error:
            "Permission denied. Maximum collaborations per day limit reached.",
        });
    }

    if (quote.status !== "published" || quote.collaborationMode !== true) {
      return res
        .status(403)
        .json({ message: "Quote is not eligible for collaboration" });
    }

    if (subscription.name !== "standard" && subscription.name !== "premium") {
      return res
        .status(403)
        .json({
          message: "User must be standard or premium for collaboration request",
        });
    }

    if (collaborationId) {
      const updateCollab = await Collaboration.findOne({
        where: { id: collaborationId },
      });

      if (updateCollab) {
        if (
          updateCollab.userId === userId &&
          updateCollab.status === "pending"
        ) {
          updateCollab.addText = addText;
          await updateCollab.save();

          return res
            .status(201)
            .json({ message: "Collaboration updated succesfully" });
        } else {
          const error = new Error("Permission denied");
      error.statusCode = 403;

      throw error;  
        }
      } else {
        const error = new Error("Collaboration with provided ID not found");
      error.statusCode = 204;

      throw error;  
      }
    }

    const collaboration = await Collaboration.create({
      userId: userId,
      quoteId: quoteId,
      addText: addText,
    });
    res.json({ message: "Collaboration created successfully." });
  } catch (error) {

    next(error);
  }
};

exports.deleteCollaboration = async (req, res, next) => {
  try {
    const { collaborationId } = req.body;
    console.log("collabid===>", collaborationId);
    const userId = req.user.id;

    const collaboration = await Collaboration.findByPk(collaborationId, {
      include: Quote,
    });

    if (!collaboration) {
      const error = new Error("Collaboration with provided ID not found");
      error.statusCode = 204;

      throw error; 

    }
    if (
      collaboration.userId === userId ||
      collaboration.quote.userId === userId
    ) {
      await collaboration.destroy();
      return res
        .status(200)
        .json({ message: "collaboration deleted successfully" });
    } else {
      const error = new Error("Permission denied");
      error.statusCode = 403;

      throw error; 
    }
  } catch (error) {
      next(error);
  }
};

exports.getCollaboration = async (req, res, next) => {
  try {
    const quoteId = req.query.quoteId;
    const quoteExists = quoteId ? await Quote.findByPk(quoteId) : true;

    console.log("quoteexists==>", quoteExists);
    
    if (!quoteExists) {
      const error = new Error("Quote not found");
      error.statusCode = 204;

      throw error;  
    }
    let whereCondition = {};
   
    if (quoteId) {
      const quote = await Quote.findByPk(quoteId);
      if (!quote) {
        const error = new Error("Quote not found");
        error.statusCode = 204;
  
        throw error;  

      }
      //check if user is owner of quote then return collaborations on this quote
      if (quote.userId === req.user.id) {
        whereCondition = {
          quoteId: quoteId,
        };
      }

      //user is collaborator then return collaborations he/she made on this quote
      else{

        whereCondition = {
          quoteId: quoteId,
          userId:req.user.id
        };
      }
    }
    else{
      //find all collaborations user made on other quotes as collaborator
      whereCondition={
        userId:req.user.id
      }
    }

    
      let allCollaborations = await Collaboration.findAll({
        where: whereCondition,
        attributes: ["id", "addText"],
      });

      if (allCollaborations.length === 0) {
        return res.json({ message: "No collaboration found" });
      }
      res.json({ data: allCollaborations });
    
  } catch (error) {

    next(error);
  }
};


exports.approveCollaboration = async (req,res,next)=>{
  try {
    
    const {collaborationId}=req.body;
    const userId = req.user.id;
    const collaboration = await Collaboration.findByPk(collaborationId, {
      include: Quote
    });

    if (!collaboration) {
      const error = new Error("Collaboration not found");
        error.statusCode = 204;
  
        throw error;  
    }
    const quote = collaboration.Quote;
    console.log("quote===>", quote);
    if (quote.userId !== userId) {
      const error = new Error("Permission denied. Only the quote owner can approve the collaboration.");
      error.statusCode = 403;
      throw error;  
      
    }

    collaboration.status = 'approved';
    await collaboration.save();

    res.json({ message: 'Collaboration request approved successfully.' });
  } 

  catch (error) {

    next(error);
  }
}



