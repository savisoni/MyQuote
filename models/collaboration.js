const Sequelize= require("sequelize");
const sequelize = require("../util/database");

const Collaboration = sequelize.define("collaboration", {
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        autoIncrement:true,
        primaryKey:true
    },
    permissionGranted :{
        type:Sequelize.BOOLEAN,
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
        }
},{paranoid:true});

module.exports = Collaboration;