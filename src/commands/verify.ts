import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from "discord.js";
import { getConnection } from "../helpers/dbConn";
import { isEmailWaitListed } from "../helpers/query";

const conn = getConnection();

export const data = new SlashCommandBuilder()
  .setName("verify")
  .setDescription("Verify your email address")
  .addStringOption(option =>
    option
      .setName("email")
      .setDescription("Your email address")
      .setRequired(true)
  );

  export async function execute(interaction: ChatInputCommandInteraction) {
    const email = interaction.options.getString("email", true);
  
    let isWaitListed = "Not Waitlisted";
  
    try {
      const results = await isEmailWaitListed(email) as { isWaitListed: boolean }[];
      if (results.length > 0) {
        isWaitListed = results[0].isWaitListed ? "Waitlisted" : "Not Waitlisted";
  
        if (isWaitListed === "Waitlisted") {
          const member = interaction.member;
          if (member instanceof GuildMember) { 
            const role = member.guild.roles.cache.find(role => role.name === "Waitlisted");
            if (role) {
              await member.roles.add(role).catch(console.error);
            }
          } else {
            console.error("Member is not of type GuildMember.");
          }
        }
      }
    } catch (err) {
      console.error("Error checking if email is waitlisted:", err);
      return interaction.reply({
        content: "Error checking if email is waitlisted",
        ephemeral: true
      });
    }
  
    return interaction.reply({
      content: `Your email is: ${isWaitListed}`,
      ephemeral: true
    });
  }