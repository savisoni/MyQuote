const Sequelize= require("sequelize");
const sequelize = require("../util/database");

const Customer= sequelize.define("customer",{
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        autoIncrement:true,
        primaryKey:true

    },
    customerId:{
        type:Sequelize.STRING,
        allowNull:false,

    }

});

Customer.associate =(models)=>{
    Customer.belongsTo(models.user);
    
  }
  
  module.exports = Customer;