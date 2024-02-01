const { Project, Client, SentEmail } = require("../models");
const { sendReminderEmail } = require("../services/emailService");
const { recordSentEmail } = require("../services/projectService");

// Manually send email to client (Project starting reminder)
const manuallySendEmail = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // Fetch the project details along with the associated client
    const project = await Project.findOne({
      where: { id: projectId },
      include: [
        {
          model: Client,
          as: "client",
          attributes: ["email"],
        },
      ],
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const to = project.client.email;
    const projectName = project.name;
    const sharedLinkToken = project.sharedLinkToken;

    // Send the email
    await sendReminderEmail(to, projectName, sharedLinkToken);

    // Record the sent email
    await recordSentEmail(project.id, to, sharedLinkToken);

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get sent emails for a project
const getSentEmailsForProject = async (req, res) => {
  // Pagination
  let page = parseInt(req.query.page);
  let per_page = parseInt(req.query.per_page || 10);
  const offset = page ? page * per_page : 0;

  try {
    const projectId = req.params.projectId;

    // Fetch the sent emails for the specified project
    const sentEmails = await SentEmail.findAll({
      // pagination
      limit: per_page,
      offset: offset,
      where: { projectId },
      attributes: ["clientEmail", "sharedLinkToken", "createdAt"],
    });

    return res.status(200).json({
      message: "Sent emails retrieved successfully",
      sentEmails,
    });
  } catch (error) {
    console.error("Error getting sent emails:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get all sent emails
const getAllSentEmails = async (req, res) => {
  // Pagination
  let page = parseInt(req.query.page);
  let per_page = parseInt(req.query.per_page || 10);
  const offset = page ? page * per_page : 0;

  try {
    // Fetch all sent emails
    const sentEmails = await SentEmail.findAll({
      // pagination
      limit: per_page,
      offset: offset,
      attributes: ["projectId", "clientEmail", "sharedLinkToken", "createdAt"],
    });

    return res.status(200).json({
      message: "All sent emails retrieved successfully",
      sentEmails,
    });
  } catch (error) {
    console.error("Error getting all sent emails:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getSentEmailsForProject,
  getAllSentEmails,
  manuallySendEmail,
};
