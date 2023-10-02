const Sequelize= require("sequelize");
const sequelize = require("../util/database");
const Comment = sequelize.define("comment",{
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        autoIncrement:true,
        primaryKey:true
    },
    comment:{
        type:Sequelize.STRING,
        allowNull:false
    },
    isDeleted:{
        type:Sequelize.BOOLEAN,
        defaultValue:false
    }
    ,
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
{
    paranoid: true
});

module.exports = Comment;

