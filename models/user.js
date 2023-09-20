const Sequelize= require("sequelize");

const sequelize = require("../util/database");

const User = sequelize.define('user',{
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        autoIncrement:true,
        primaryKey:true
    },

    username:{
        type:Sequelize.STRING,
        allowNull:false
    }, 
    
    email:{
        type:Sequelize.STRING,
        allowNull:false

    },
    password:{
        type:Sequelize.STRING,
        allowNull:false
    },
    resetToken:Sequelize.STRING,
    resetTokenExpiration:Sequelize.DATE,

    isValid: {
        type:Sequelize.BOOLEAN,
        defaultValue:false
    },
    verificationToken:Sequelize.STRING,
    
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
    

})

module.exports = User;