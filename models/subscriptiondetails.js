const Sequelize= require("sequelize");
const sequelize = require("../util/database");

const SubscriptionsDetail = sequelize.define("subscriptiondetails",{
    id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    subcription_details:{
        type:Sequelize.TEXT,
        allowNull:true
    },
    isActive:{
        type:Sequelize.BOOLEAN,
        defaultValue:false
    },
    startDate:{
        type:Sequelize.DATE

    },
    endDate:{
        type:Sequelize.DATE

    }

},
{paranoid:true}
);


SubscriptionsDetail.associate =(models)=>{
    SubscriptionsDetail.belongsTo(models.user);
    SubscriptionsDetail.belongsTo(models.subscription);
    
  }
  
  module.exports = SubscriptionsDetail;
