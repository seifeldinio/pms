"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("SentEmails", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      projectId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      clientEmail: {
        type: Sequelize.STRING(191), // Limit the size to 191 characters
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      sharedLinkToken: {
        type: Sequelize.STRING(191), // Limit the size to 191 characters
        allowNull: false,
        unique: false,
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
    await queryInterface.dropTable("SentEmails");
  },
};
