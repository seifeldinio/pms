const cron = require("node-cron");
const { Op } = require("sequelize");
const { Project, Client } = require("../models");
const { recordSentEmail } = require("./projectService");
const { sendReminderEmail } = require("./emailService");

let cronJobPromise;

const start = () => {
  cronJobPromise = new Promise(async (resolve) => {
    cronJob = cron.schedule("0 0 * * *", async () => {
      try {
        // console.log("Scheduler triggered at:", new Date());

        const today = new Date();

        // Find projects with start date equals to today
        const upcomingProjects = await Project.findAll({
          where: {
            startDate: {
              [Op.gte]: today,
            },
            // status: "Open",
          },
          include: [
            {
              model: Client,
              as: "client",
              attributes: ["email"],
            },
          ],
        });

        // console.log("Upcoming projects for today:", upcomingProjects);

        for (const project of upcomingProjects) {
          const clientEmail = project.client.email;

          // console.log("Sending email to:", clientEmail);
          // console.log("Sending email for project:", project.name);

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
