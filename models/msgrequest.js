const Sequelize= require("sequelize");
const sequelize = require("../util/database");

const MsgRequest = sequelize.define("msgrequest",{
    id:{
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement:true,
        allowNull:false
    },
    receiverId:{
        type:Sequelize.INTEGER,
        allowNull:false
    },
    isApproved:{
        type:Sequelize.BOOLEAN,
        defaultValue:false
    },
    requestMessage:{
        type:Sequelize.STRING
    }
});

MsgRequest.associate =(models)=>{
    MsgRequest.belongsTo(models.user,{foreignKey:"senderId",foreignKeyConstraint:true});
    
}

module.exports = MsgRequest;

