import {
  APIInteractionGuildMember,
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { isEmailWaitListed } from "../helpers/query";
import { getConnection } from "../helpers/dbConn";

let waitlistedMembers: (GuildMember | APIInteractionGuildMember | null)[] = [];

const conn = getConnection();
export const data = new SlashCommandBuilder()
  .setName("verify")
  .setDescription("Verify your email address")
  .addStringOption((option) =>
    option
      .setName("email")
      .setDescription("Your email address")
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const email = interaction.options.getString("email", true);
  let isWaitListed = "Not Waitlisted";

  try {
    if (waitlistedMembers.length > 0 && waitlistedMembers.includes(interaction.member)) {
      await interaction.reply({
        content: "You are already verified",
        flags: "Ephemeral",
      });
      return;
    }

    const results = (await isEmailWaitListed(email)) as {
      isWaitListed: boolean;
    }[];
    if (results.length > 0) {
      isWaitListed = results[0].isWaitListed ? "Waitlisted" : "Not Waitlisted";

      if (isWaitListed === "Waitlisted") {
        const member = interaction.member;
        if (member instanceof GuildMember) {
          const role = member.guild.roles.cache.find(
            (role) => role.name === "Waitlisted"
          );
          if (role) {
            await member.roles.add(role).catch(console.error);
            await interaction.reply({
              content: "You have been successfully verified",
              flags: "Ephemeral",
            });   
            
            waitlistedMembers.push(member);
            
          }
        } else {
          console.error("Member is not of type GuildMember.");
        }
      } else {
        await interaction.reply(
          "Your email is not waitlisted. Visit https://pex-labs.com to join the waitlist"
        );
        return;
      }
    }
  } catch (err) {
    console.error("Error checking if email is waitlisted:", err);
    await interaction.reply({
      content: "Error checking if email is waitlisted",
      flags: "Ephemeral",
    });
    return;
  }
}
