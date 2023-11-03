const Sequelize = require("sequelize");
const sequelize = require("../util/database");
// const User = require("./user");

const Subscription = sequelize.define(
  "subscription",
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: Sequelize.STRING,
      unique: true,
    },
    maxQuotes: {
      type: Sequelize.INTEGER,
    },
    maxCollaborationPerDay: {
      type: Sequelize.INTEGER,
    },
    StripeProductId:{
     type:Sequelize.STRING
    },
    
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), 
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
        }
  },
  { paranoid: true }
);



Subscription.associate =(models)=>{
  // Subscription.hasMany(models.user);
  Subscription.hasMany(require("./subscriptiondetails"));
  
}

module.exports = Subscription;