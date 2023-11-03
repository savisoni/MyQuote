// const Quote = require("../../models/quote");
const { validationResult } = require("express-validator");
const Sequelize = require("sequelize");
const { Op, Model } = require("sequelize");


const sequelize= require("../../util/database");
const readModels = require("../../models/index");
const User = readModels.user;
const Quote= readModels.quote;
const Like = readModels.like;
const Comment = readModels.comment;
const Subscription = readModels.subscription;
const SubscriptionsDetail = readModels.subscriptiondetails
const Collaboration = readModels.collaboration;
const Customer = readModels.customer;
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
    console.log("req.user=>", req.user);

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

    const subscription_details= await SubscriptionsDetail.findOne({where:{userId:req.user.id}});
    console.log("subscription data ----------------====>", subscription_details);
    const quotesCreated = await User.findByPk(user.id, { include: Quote });
    console.log("quotes numbers==>" ,quotesCreated.quotes.length);
    let plan;
    // if (!subscription_details) {
    //    plan= await Subscription.findOne({where:{name:"basic"}});
    //    console.log("plan===>", plan.maxQuotes);
    //   if (quotesCreated.quotes.length > plan.maxQuotes) {
    //     return res
    //       .status(403)
    //       .json({ message: "basic limit has been reached" });
    //   }
    // }
    // else{
    //   plan = await Subscription.findOne({where:{id:subscription_details.subscriptionId}});
    //   console.log("plan===>", plan.maxQuotes);

    //   if (quotesCreated.quotes.length>plan.maxQuotes) {
    //     return res
    //     .status(403)
    //     .json({ message: "subscription limit has been reached" });
    //   }
    // }
   
    
    // // switch (subscription.name) {
    // //   case "basic":
    // //     if (quotesCreated.quotes.length > subscription.maxQuotes) {
    // //       return res
    // //         .status(403)
    // //         .json({ message: "basic subscription limit has been reached" });
    // //     }
    // //     break;
    // //   case "standard":
    // //     if (monthlyQuoteCount > subscription.maxQuotes) {
    // //       return res
    // //         .status(403)
    // //         .json({ message: "standard subscription limit has been reached" });
    // //     }
    // //     break;
    // //   case "premium":
    // //     if (monthlyQuoteCount > subscription.maxQuotes) {
    // //       return res
    // //         .status(403)
    // //         .json({ message: "premium subscription limit has been reached" });
    // //     }
    // //     break;
    // //   default:
    // //     return res.status(400).json({ message: "Unknown user role" });
    // // }

    // const quote = await Quote.create({
    //   title: title,
    //   content: content,
    //   userId: req.user.id,
    //   collaborationMode: collaborationMode,
    // });
    if (!subscription_details) {
      plan = await Subscription.findOne({ where: { name: "basic" } });
    } else {
      plan = await Subscription.findOne({ where: { id: subscription_details.subscriptionId } });
    }
    
    console.log("plan===>", plan.maxQuotes);
    
    if (quotesCreated.quotes.length >= plan.maxQuotes) {
      return res.status(403).json({ message: subscription_details ? "Subscription limit has been reached" : "Basic limit has been reached" });
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
    //remove other data related to quote if quote is deleted
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
    if (quote.status !== "published" || quote.collaborationMode !== true) {
      return res
        .status(403)
        .json({ message: "Quote is not eligible for collaboration" });
    }

   
    // const subscription = await Subscription.findByPk(user.subscriptionId);
    const subscription_details= await SubscriptionsDetail.findOne({where:{userId:req.user.id}});
let plan;
    if (!subscription_details) {
      plan = await Subscription.findOne({ where: { name: "basic" } });
    } else {
      plan = await Subscription.findOne({ where: { id: subscription_details.subscriptionId } });
    }
    if (plan.name !== "standard" && plan.name !== "premium") {
      return res
        .status(403)
        .json({
          message: "User must be standard or premium for collaboration request",
        });
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

    if (collaborationsToday>= plan.maxCollaborationPerDay) {
      return res.status(403).json({ message: subscription_details ? "Subscription limit has been reached for collaboration" : "Please Subscribe for collaboration" });
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


// const handleCustomers = async(user,res)=>{
//   const customer =await Customer.findByPk(user.id);
//   console.log("customer==>", customer);
//     let customerAdd;
//     //check if customer present or not
//      if (!customer) {
//         customerAdd =await stripe.customers.create({email:user.email});
//   console.log("customerAdd",customerAdd);
//         const newCustomer = await Customer.create({userId:user.id});
        
        
//      }
//      return customerAdd;
  
// }

exports.createCheckout = async (req, res) => {

  const user = req.user;
  console.log("----------userdata-------", req.user.id);
  const priceId = req.params.priceId; 
  try {
    let customerAdd;
    let customer = await Customer.findOne({where:{userId:req.user.id}});
    console.log("Customer:", customer);

    if (!customer) {
        customerAdd = await stripe.customers.create({ email: user.email });

        customer = await Customer.create({
          userId: user.id,
          customerId:customerAdd.id
        });

        console.log('New Customer:', customer);
      //  res.json({message:"New"})

    }
    else{
      return res.json({message:"Customer already exists"})
    }
 
    
    const cardToken = 'tok_visa';

    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        token: cardToken,
      },
    });
    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: customerAdd.id,
    });
    await stripe.customers.update(customerAdd.id, {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    });
    // const session={};
    

    const session= await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: customerAdd.id,
      line_items: [
        {price: priceId,quantity:1},
      ],
      mode: 'subscription',
      success_url: req.protocol + '://' + req.get('host') + '/quote/checkout/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel',
    });
    
    // session.id=sessionCreated.id;

    console.log('Checkout Session:', session);

    res.send({session: session.url});
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' , error});
  }
  //   // const currentSubscription = await stripe.subscriptions.retrieve(customer.stripeSubscriptionId);

  //  }

  

};


exports.checkoutSuccess = async(req,res)=>{
  const { session_id } = req.query; 

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id,{ expand: ['line_items']});
console.log("session==>", session.payment_intent);
    if (session.payment_status === 'paid') {
      const line_items = session.line_items;

      console.log("line items ==>", line_items);
      console.log("line items nbvnvnv ==>", line_items.data[0].price.id);

      const customerId = session.customer;
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items:  line_items.data.map(item => ({
          price: item.price.id,
          quantity:1
        }))
      });

      // await SubscriptionsDetail.create({
      //      subscriptionId:
      // })



      console.log("subscription det===>", subscription.plan.id);
      console.log("subscription det===>", subscription.plan.product);
      console.log("subscription det===>", subscription.customer);
      const startingDate = new Date(subscription.current_period_start * 1000);
      const endingDate = new Date(subscription.current_period_end * 1000);
      
      // const startDateString = startingDate.toLocaleString(); // Format as per user's locale
      // const endDateString = endingDate.toLocaleString(); 

      const plan = await Subscription.findOne({where:{StripeProductId:subscription.plan.product}});
      console.log("plan details===>", plan);
      const customer = await Customer.findOne({where:{customerId:subscription.customer}}) ;
      console.log("customer detail===>", customer);
  await SubscriptionsDetail.create({
      subscriptionId:plan.id,
      userId:customer.userId,
      startDate:startingDate,
      endDate:endingDate,
      subcription_details:JSON.stringify(subscription)
  })

      


  
      // console.log("userdetail====>", );

console.log("subscription====>", subscription);
      res.send('Payment was successful, and a subscription was created!');
    } else {
      res.status(400).send('Payment was not successful');
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred');
  }
}



// exports.createCustomer = async (req, res) => {
//   try {
//     const { stripeProductId } = req.body;
//     const user = req.user;

//     const customer = await stripe.customers.create({
//       email: user.email
//     });
//     //entry too in customer table

//     const subscription = await stripe.subscriptions.create({
//       customer: customer.id,
//       items: [{ price: stripeProductId }],
//     });
//     //entry too in subscriptions table new

//     res.json({ customerId: customer.id, subscriptionId: subscription.id });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


//checkout
//payment methods
//customer and subscription create



