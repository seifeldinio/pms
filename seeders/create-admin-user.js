const bcrypt = require("bcrypt");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash("123456", 10);

    await queryInterface.bulkInsert("Users", [
      {
        name: "Admin",
        email: "admin@gmail.com",
        password: hashedPassword,
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the admin user during rollback
    await queryInterface.bulkDelete("Users", null, {});
  },
};
