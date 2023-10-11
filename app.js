const express = require("express");

const bodyParser = require("body-parser");
const sequelize = require("./util/database");
const passport = require("passport");
 require("./helpers/passport")(passport);

const models = require("./models/index");
const mainRoute = require("./routes");
const app = express();

app.use(bodyParser.json());



app.use("/", mainRoute);
app.use((error, req, res, next) => {
    console.log("error------>>>>" ,error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    console.log("errorrrfdkslsdfgnmkdlsjhnrbgmvcksjndmf");
    res.status(status).json({status:status, message: message ,  data:data});
    
  });



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
