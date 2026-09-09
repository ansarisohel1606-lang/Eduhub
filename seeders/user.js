
"use strict";

const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash("Eduhub@786", 10);

    await queryInterface.bulkInsert("users", [
      {
        name: "Student User",
        email: "student@gmail.com",
        password: passwordHash,
        role: "student",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Teacher User",
        email: "teacher@gmail.com",
        password: passwordHash,
        role: "teacher",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Admin User",
        email: "admin@gmail.com",
        password: passwordHash,
        role: "admin",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", {
      email: {
        [Sequelize.Op.in]: [
          "student@gmail.com",
          "teacher@gmail.com",
          "admin@gmail.com",
        ],
      },
    });
  },
};
