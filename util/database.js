const {Sequelize} = require("sequelize");

const sequelize = new Sequelize("demoproject","root","Kri$hn@&75#",{
    dialect:"mysql",
    host:"localhost",
    timezone:"+05:30"
});

module.exports = sequelize;