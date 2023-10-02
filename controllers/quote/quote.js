const Quote = require("../../models/quote");
const { validationResult } = require("express-validator");
const Sequelize = require("sequelize");
const { Op, Model } = require("sequelize");
const Like = require("../../models/like");
const User = require("../../models/user");
const Comment = require("../../models/comment");
const Subscription = require("../../models/subscription");
const Collaboration = require("../../models/collaboration");
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
    const quoteId = req.params.quoteId;
    console.log(quoteId);
    let test = [];

    if (quoteId) {
      const quotedata = await Quote.findByPk(quoteId);
      if (!quotedata) {
        const error = new Error("No quote found with this id");
        error.statusCode = 401;

        return next(error);
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
  
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() , 1); 
      const lastDayOfMonth = new Date(currentDate.getFullYear(),currentDate.getMonth()+1,0);  


      const monthlyQuoteCount = await Quote.count({where:{userId:user.id, createdAt:{[Sequelize.Op.between]:[firstDayOfMonth,lastDayOfMonth]}}});
       
console.log("monthly quote count==>", monthlyQuoteCount);
    const { title, content, collaborationMode} = req.body;
    // console.log("user data====>", user);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json({ errors: errors.array() });
    }
    

    if (! user) {
    return res.status(404).json({ message: "user not found" });
      
    }
    
    const subscription = await Subscription.findByPk(user.subscriptionId);
// console.log("subscription data ====>", subscription);
    const quotesCreated = await User.findByPk(user.id,{include: Quote});
    // console.log("quotes numbers==>" ,quotesCreated.quotes.length);

    if (! subscription) {
      const error = new Error("No Subscription found");
      error.statusCode = 401;

      return next(error);
    }
    switch (subscription.name) {
      case "basic":
        if (quotesCreated.quotes.length >subscription.maxQuotes) {
          return res.status(403).json({message:"basic subscription limit has been reached"})
        }
        break;
    case "standard":
      if (monthlyQuoteCount > subscription.maxQuotes) {
        return res.status(403).json({message:"standard subscription limit has been reached"})
      }
        break;
    case "premium":
      if (monthlyQuoteCount > subscription.maxQuotes) {
        return res.status(403).json({message:"premium subscription limit has been reached"})
      }
        break;
      default:
        return res.status(400).json({ message: 'Unknown user role' });
        
    }

const quote = await Quote.create({
      title: title,
      content: content,
      userId: req.user.id,
      collaborationMode: collaborationMode
    });
    return res.status(201).json({ message: "success", quote: quote });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
      error.statusCode = 401;

      return next(error);
    }

    if (quote.userId !== req.user.id) {
      const error = new Error("Not Authorized");
      error.statusCode = 401;
      return next(error);
    }
    if (quote.status !== "draft") {
      const error = new Error("Quote cannot be updated");
      error.statusCode = 401;
      return next(error);
    }

    quote.title = title;
    quote.content = content;
    await quote.save();
    return res.json({ message: "updated successfully", quote: quote });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteQuote = async (req, res, next) => {
  try {
    const quoteId = req.params.quoteId;
    const quoteToDelete = await Quote.findByPk(quoteId, { include: Like });

    if (!quoteToDelete) {
      const error = new Error("No quote found with this id");
      error.statusCode = 401;
      return next(error);
    }
    // console.log("------>", quoteToDelete.userId);
    // console.log("------>", req.user.id);
    if (quoteToDelete.userId !== req.user.id) {
      const error = new Error("Not authorized");
      error.statusCode = 401;
      return next(error);
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
      console.log("instance" , instance);
      await Like.destroy({ where: { quoteId: instance.id } });
      await Comment.destroy({where: { quoteId:instance.id}})
    });
   
      quoteToDelete.destroy();
    

    return res.json({
      message: "quote deleted successfully",
      quote: quoteToDelete,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


exports.requestCollabPermission = async(req,res,next)=>{
  try {
    const {quoteId}= req.body;
    const userId = req.user.id;
     
    const user = await User.findByPk(userId);
    const quote = await Quote.findByPk(quoteId);

    const subscription = await Subscription.findByPk(user.subscriptionId);

    console.log("user sub====>", user);
    console.log("sub====>", subscription);
    
    if (!user || !quote) {
      return res.status(404).json({message:"user or quote not found"})
    }

    if (quote.status !== "published" || quote.collaborationMode !== true) {
       return res.status(401).json({message:"Quote is not eligible for collaboration"})
    }

    if (subscription.name !== "standard" && subscription.name !== "premium") {
        return res.status(401).json({message:"User must be standard or premium for collaboration request"})
    }
    
    if (userId === quote.userId) {
      return res.status(401).json({message:"Creator can not collaborate to own quote"})
      
    }

    const collaboration = await Collaboration.create({
      userId:userId,
      quoteId:quoteId,
      permissionGranted:false
    });


   res.status(201).json({message:"Collaboration request generated"});
    
  } catch (error) {
    res.status(500).json({message:"Not able to request for collaboration"})
  }
    
}

exports.grantPermission =  async(req,res,next)=>{
  try {
    
      const {addText,collaborationId}= req.body;
      const userId = req.user.id;
      const collaboration = await Collaboration.findByPk(collaborationId);
      const quoteId = collaboration.quoteId;

      const user = await User.findByPk(userId);
      const quote = await Quote.findByPk(quoteId)
      console.log("quote===>", quote);
    

// console.log("collab====================>");
      if (! collaboration || !user) {
        return res.status(404).json({message:"collaboration not found"})
      }
      if (userId !== quote.userId) {
        return res.status(403).json({message:"Only creator of quote can grant permission"})
        
      }

      if(collaboration.permissionGranted !== true){
        collaboration.permissionGranted = true;
        await collaboration.save();
        if (quote) {
          quote.content += "\n" + addText;
          await quote.save();
        }
      }
    else {
      if (quote) {
        quote.content += "\n" + addText;
          await quote.save();

      }
    }

      res.json({message:"Permission granted for collab."})

  } catch (error) {
    res.status(500).json({message:error})
  }
}





