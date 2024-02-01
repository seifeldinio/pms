const { SentEmail } = require("../models");

// Record sent email
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

module.exports = { recordSentEmail };
