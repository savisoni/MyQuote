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
    resetToken:{
        type:Sequelize.STRING,
        defaultValue:null
    },
    resetTokenExpiration:{
       type: Sequelize.DATE  ,
       defaultValue:null
    },

    isValid: {
        type:Sequelize.BOOLEAN,
        defaultValue:false
    },
    verificationToken:
    {
        type:Sequelize.STRING,
        defaultValue:null
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
    
    collaborationsToday:{
        type:Sequelize.INTEGER
    }
    

},
{
    paranoid: true
})



module.exports = User;