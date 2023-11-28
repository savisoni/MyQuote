const Sequelize= require("sequelize");
const sequelize = require("../util/database");

const Chat = sequelize.define("chat", {
    id:{
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement:true,
        allowNull:false
    },
    message:{
        type:Sequelize.TEXT,
        allowNull:false
    },
    receiverId :{
        type:Sequelize.INTEGER,
        allowNull:false
    }

})

Chat.associate=(models)=>{
    Chat.belongsTo(require("./user"), {foreignKey:"senderId", foreignKeyConstraint:true});
}

module.exports= Chat;