// Business logic for project-related operations

const { v4: uuidv4 } = require("uuid");
const { Project, Client, SentEmail } = require("../models"); // Adjust the import paths as needed

// Function to find upcoming projects
const findUpcomingProjects = async () => {
  try {
    const today = new Date();
    const upcomingProjects = await Project.findAll({
      where: {
        startDate: {
          [Op.gte]: today,
        },
      },
      include: [
        {
          model: Client,
          attributes: ["email"],
        },
      ],
    });

    return upcomingProjects;
  } catch (error) {
    console.error("Error finding upcoming projects:", error);
    throw error;
  }
};

// Function to generate a shared link token
// const generateSharedLinkToken = () => {
//   // Generate a UUID (version 4) as a shared link token
//   const token = uuidv4();
//   return token;
// };

// Function to record sent email
const recordSentEmail = async (projectId, clientEmail, sharedLinkToken) => {
  try {
    await SentEmail.create({
      projectId,
      clientEmail,
      sharedLinkToken,
    });
  } catch (error) {
    console.error("Error recording sent email:", error);
    throw new Error("Error recording sent email");
  }
};

module.exports = {
  findUpcomingProjects,
  // generateSharedLinkToken,
  recordSentEmail,
};
