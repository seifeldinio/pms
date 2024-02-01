"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProjectAssignment extends Model {
    static associate(models) {
      ProjectAssignment.belongsTo(models.User, { foreignKey: "userId" });
      ProjectAssignment.belongsTo(models.Project, { foreignKey: "projectId" });
    }
  }
  ProjectAssignment.init(
    {
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ProjectAssignment",
    }
  );
  return ProjectAssignment;
};
