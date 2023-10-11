const Sequelize= require("sequelize");

const sequelize = require("../util/database");

const Like = sequelize.define("like",{
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        autoIncrement:true,
        primaryKey:true
    },
    isLiked:{
        type:Sequelize.BOOLEAN,
        defaultValue:false
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
        },
    isDeleted:{
        type:Sequelize.BOOLEAN,
        defaultValue:false
    }

},
{
    paranoid: true
});



Like.associate=(models)=>{
    Like.belongsTo(models.quote, {constraints:true});
    Like.belongsTo(models.user,{constraints:true,onDelete:"CASCADE"});
    
}
module.exports=Like;