const express = require("express");
const User = require("./models/user");
const Quote = require("./models/quote");
const Like = require("./models/like");
const Comment = require("./models/comment");
const Collaboration = require("./models/collaboration");
const Subscription = require("./models/subscription");
const bodyParser = require("body-parser");
const sequelize = require("./util/database");
const passport = require("passport");
const jwtStrategy= require("passport-jwt").Strategy;
const ExtractJwt= require("passport-jwt").ExtractJwt;


const mainRoute = require("./routes");
const app = express();

app.use(bodyParser.json());

const jwtOptions={
    jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey :"somesecretkey"
}

passport.use(new jwtStrategy(jwtOptions,async(jwtPayload,done)=>{
    try {
        console.log("jwtPayload", jwtPayload);
        const user = await User.findByPk(jwtPayload.id)
        if (user) {
            console.log("user=====>", user);
            return done(null,user)
        }
        else{
            return done(null,false)
        }
    } catch (error) {
        return done(error,false)
    }
}))

app.use("/", mainRoute);
app.use((error, req, res, next) => {
    console.log("error------>>>>" ,error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
     res.status(status).json({status:status, message: message ,  data:data});
    console.log("errorrrfdkslsdfgnmkdlsjhnrbgmvcksjndmf");
    // throw error;
  });

User.belongsTo(Subscription,{constraints:true});
Subscription.hasMany(User);


// Quote.belongsTo(User, {foreignKey:"userId", constraints: true, onDelete: "CASCADE"});
// User.hasMany(Quote);

User.belongsToMany(Quote,{through:Collaboration});
Quote.belongsToMany(User,{through:Collaboration});
Quote.belongsTo(User, {foreignKey:"userId", constraints: true, onDelete: "CASCADE"});

Like.belongsTo(Quote, {constraints:true});
Quote.hasMany(Like);

Like.belongsTo(User,{constraints:true,onDelete:"CASCADE"});
User.hasMany(Like);

Comment.belongsTo(Quote, {constraints:true});
Quote.hasMany(Comment);

Comment.belongsTo(User,{constraints:true,onDelete:"CASCADE"});
User.hasMany(Comment);


(async()=>{
    try {
        await sequelize.authenticate();
        console.log("database connection established successfully");
        await sequelize.sync();
        console.log("database synchronization completed");
        app.listen(4000,()=>{
            console.log("server listening on http://localhost:4000");
        })

    } catch (error) {
        console.log("Not able to connect to database", error.message);
    }
})();
