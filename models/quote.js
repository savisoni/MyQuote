const Sequelize= require("sequelize");
const sequelize = require("../util/database");

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
        type:Sequelize.STRING,
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
});

module.exports = Quote;