const bcrypt = require("bcrypt");
const { sequelize } = require("../app");
const { User } = require("../models");

const setupDatabase = async () => {
  // checks the database connectivity
  await sequelize
    .authenticate()
    .then(() => {
      console.log("Connection has been established successfully.");
    })
    .catch((err) => {
      console.error("Unable to connect to the database:", err);
    });

  // Clear all tables
  await sequelize
    .sync({ force: true, alter: true, charset: "utf8mb4" })
    .then(() => {
      console.log("Database synced");
    });

  // Create the admin user
  const hashedPassword = await bcrypt.hash("123456", 10);
  const adminUser = await User.create({
    email: "admin@gmail.com",
    password: hashedPassword,
    name: "Admin",
    isAdmin: true,
  });

  // Create some technician users
  const technician1 = await User.create({
    email: "technician1@gmail.com",
    password: hashedPassword,
    name: "First Technician",
  });

  const technician2 = await User.create({
    email: "technician2@gmail.com",
    password: hashedPassword,
    name: "Second Technician",
  });

  const technician3 = await User.create({
    email: "technician3@gmail.com",
    password: hashedPassword,
    name: "Third Technician",
  });

  return { adminUser, technician1, technician2, technician3 };
};

module.exports = { setupDatabase };
