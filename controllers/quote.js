const Quote = require("../models/quote");
const { validationResult } = require("express-validator");

const {Op} = require("sequelize")

exports.getQuotes = async (req, res, next) => {
  try {
    const {sortBy,sortOrder ,searchField, searchKey , filterField , filterValue}= req.query;
    
    
    let test=[];
    
    
    //sorting
    if (sortBy && sortOrder) {
      // sortObj = {[sortBy]:sortOrder}
      // test = Object.entries(sortObj)
      test.push(sortBy);
      test.push(sortOrder);
      options.order=[test];
      console.log(options);
      
    }
     
    //searching
    const searchObj ={}
    if (searchField && searchKey) {
      searchObj[searchField] = { [Op.like]: `%${searchKey}%` };
      // options.where = {...searchObj}
      // console.log();
    }
    
    const filterObj ={}
    
    if (filterField && filterValue) {
      filterObj[filterField]={[Op.eq]:filterValue};
      console.log(filterObj);
    }
    
    const options ={where:{...searchObj, ...filterObj}};
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
    const { title, content , collaborationMode} = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json({ errors: errors.array() });
    }
    const quote = await Quote.create({
      title: title,
      content: content,
      userId: req.user.id,
      collaborationMode:collaborationMode
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

    quote.title = title;
    quote.content = content;
    await quote.save();
    return res.json({ message: "updated", quote: quote });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteQuote = async (req, res, next) => {
  try {
    const quoteId = req.params.quoteId;
    const quoteToDelete = await Quote.findByPk(quoteId);
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
    quoteToDelete.isDeleted = true;
    await quoteToDelete.save()
    return res.json({
      message: "quote deleted successfully",
      quote: quoteToDelete,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
