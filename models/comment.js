"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      models.Comment.belongsTo(models.Project, {
        foreignKey: "projectId",
        as: "project",
      });
      models.Comment.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
        attributes: ["name", "email"], // Include name and email attributes
      });
    }
  }

  Comment.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Comment",
    }
  );

  return Comment;
};
