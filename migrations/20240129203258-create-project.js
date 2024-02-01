"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Projects", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING(191), // Limit the size to 191 characters
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING(191), // Limit the size to 191 characters
        allowNull: false,
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      dueDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      noteToClient: {
        type: Sequelize.STRING(191), // Limit the size to 191 characters
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(191), // Limit the size to 191 characters
        allowNull: false,
        defaultValue: "Open",
      },
      clientId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      sharedLinkToken: {
        type: Sequelize.STRING(191), // Limit the size to 191 characters
        allowNull: true,
        unique: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Projects");
  },
};
