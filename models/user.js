"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
      User.belongsToMany(models.Project, {
        through: models.ProjectAssignment,
        as: "assignedTechnicians",
        foreignKey: "userId",
      });
    }

    validatePassword(password) {
      try {
        return bcrypt.compareSync(password, this.password);
      } catch (error) {
        console.error("Error comparing passwords:", error);
        throw new Error("Error comparing passwords");
      }
    }

    // to generate the token
    generateToken() {
      const token = jwt.sign(
        { id: this.id, email: this.email, isAdmin: this.isAdmin },
        process.env.JWT_SECRET || "98tBdNTt6RCPjeLQbQgVwjLgDMUlunA3"
      );

      return token;
    }
  }

  User.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        // allowNull: false,
        get() {
          return this.id;
        },
      },
      email: {
        type: DataTypes.STRING(191), // Limit the size to 191 characters
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING(191), // Limit the size to 191 characters
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(191), // Limit the size to 191 characters
        allowNull: false,
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Default value is false (non-admin)
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );

  User.beforeSave(async (user) => {
    if (user.changed("password")) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  return User;
};
