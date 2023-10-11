const Sequelize= require("sequelize");
const sequelize = require("../util/database");
const Like = require("../models/like");
const Quote = sequelize.define('quote',{
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        autoIncrement:true,
        primaryKey:true
    },
    title:{
        type:Sequelize.STRING,
        allowNull:false

    },
    content:{
        type:Sequelize.STRING,
        allowNull:false
    },
    collaborationMode:{
        type:Sequelize.BOOLEAN,
        defaultValue:false
    },
    status:{
        type:Sequelize.STRING,
        defaultValue:"draft"
    },
    isDeleted :{
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
        }
},
{
    paranoid: true
});


Quote.associate=(models)=>{
    Quote.hasMany(models.collaboration);
    Quote.hasMany(models.like);
    Quote.hasMany(models.comment);
    
    Quote.belongsTo(models.user, {constraints: true});
    
}
module.exports = Quote;