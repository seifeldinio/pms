"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SentEmail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SentEmail.belongsTo(models.Project, { foreignKey: "projectId" });
    }
  }
  SentEmail.init(
    {
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      clientEmail: {
        type: DataTypes.STRING(191), // Limit the size to 191 characters
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      sharedLinkToken: {
        type: DataTypes.STRING(191), // Limit the size to 191 characters
        allowNull: false,
        unique: false,
      },
    },
    {
      sequelize,
      modelName: "SentEmail",
    }
  );
  return SentEmail;
};
