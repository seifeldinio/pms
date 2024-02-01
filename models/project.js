"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Project.belongsToMany(models.User, {
        through: models.ProjectAssignment,
        as: "assignedTechnicians",
        foreignKey: "projectId",
      });

      // Association with comments
      models.Project.hasMany(models.Comment, {
        foreignKey: "projectId",
        as: "comments",
      });

      // Association with client
      Project.belongsTo(models.Client, {
        foreignKey: "clientId",
        as: "client",
      });

      // Association with Sent Emails
      Project.hasMany(models.SentEmail, {
        foreignKey: "projectId",
        as: "sentEmails",
      });
    }
  }
  Project.init(
    {
      projectId: {
        type: DataTypes.INTEGER,
        // allowNull: false,
        get() {
          return this.id;
        },
      },
      name: {
        type: DataTypes.STRING(191), // Limit the size to 191 characters
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(191), // Limit the size to 191 characters
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      noteToClient: {
        type: DataTypes.STRING(191), // Limit the size to 191 characters
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(191), // Limit the size to 191 characters
        allowNull: false,
        defaultValue: "Open",
      },
      clientId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      sharedLinkToken: {
        type: DataTypes.STRING(191), // Limit the size to 191 characters
        allowNull: true,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "Project",
    }
  );
  return Project;
};
