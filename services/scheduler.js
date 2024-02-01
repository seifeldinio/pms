const cron = require("node-cron");
const { Op } = require("sequelize");
const { Project, Client } = require("../models");
const { recordSentEmail } = require("./projectService");
const { sendReminderEmail } = require("./emailService");

let cronJobPromise;

const start = () => {
  cronJobPromise = new Promise((resolve) => {
    //     cronJob = cron.schedule("0 0 * * *", async () => {
    cronJob = cron.schedule("0 21 * * *", async () => {
      try {
        const upcomingProjects = await Project.findAll({
          where: {
            startDate: { [Op.lt]: new Date() },
            status: "Open",
          },
          include: [
            {
              model: Client,
              as: "client",
              attributes: ["email"],
            },
          ],
        });

        for (const project of upcomingProjects) {
          const clientEmail = project.client.email;

          await sendReminderEmail(
            clientEmail,
            project.name,
            project.sharedLinkToken
          );

          await recordSentEmail(
            project.id,
            clientEmail,
            project.sharedLinkToken
          );
        }
      } catch (error) {
        console.error("Error sending scheduled reminders:", error);
      }
    });

    // Resolve the promise after the cron job has started
    resolve();
  });
};

const getCronJob = () => {
  return cronJobPromise.then(() => cronJob);
};

module.exports = { start, getCronJob };
