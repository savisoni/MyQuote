const Sequelize= require("sequelize");
const sequelize = require("../util/database");
const readModels= require("./index");

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
    addText:{
       type:Sequelize.TEXT,
       allowNull:false
    },
    status:{
      type:Sequelize.TEXT,
      defaultValue:"pending"
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


Collaboration.associate=(models)=>{
    console.log("models======================>", models);
    Collaboration.belongsTo(models.user, { foreignKey: 'userId' });
    Collaboration.belongsTo(models.quote, { foreignKey: 'quoteId' });
    
}
module.exports = Collaboration;