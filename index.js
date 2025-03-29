require("dotenv").config();
const { Telegraf } = require("telegraf");
const axios = require("axios");
const path = require("path"); // Add this to handle file paths

const bot = new Telegraf(process.env.BOT_TOKEN);

// Function to fetch SOL balance
async function getSolBalance(walletAddress) {
  try {
    const response = await axios.post("https://api.mainnet-beta.solana.com", {
      jsonrpc: "2.0",
      id: 1,
      method: "getBalance",
      params: [walletAddress],
    });

    const balanceLamports = response.data.result.value;
    const balanceSol = balanceLamports / 1e9; // Convert lamports to SOL
    return balanceSol;
  } catch (error) {
    return null;
  }
}

// Function to generate a sarcastic response
function generateRoast(balance) {
  if (balance === null) {
    return "Bruh, that ain't even a real wallet. Try again. 😂";
  } else if (balance === 0) {
    return "Wow... 0 SOL? You must be living life on the edge. 🚀💸";
  } else if (balance < 0.1) {
    return `You got ${balance} SOL... That's like enough for a transaction fee. Big spender! 😂`;
  } else if (balance < 1) {
    return `Hustling your way up, huh? ${balance} SOL—one step closer to the yacht. 😂`;
  } else {
    return `Whoa! ${balance} SOL? Are you the secret whale of Solana? Don't rug us bro. 🐳😂`;
  }
}

// Handle new members joining the group
bot.on("new_chat_members", async (ctx) => {
  const newUser = ctx.message.new_chat_member.first_name;
  const welcomeMessage = `Hey, ${newUser}! 🎉  
  I hope your emotions don't get hurt easily🙄 and you can take a joke😑...  
  Let me peep into your Solana holdings😁. I promise i'll be nice🥺 Just type *fry me* in this group, and I'll DM you.`;

  // Path to the image in your project folder (adjust the filename as needed)
  const imagePath = path.join(__dirname, "images", "Solana.jpg"); // Replace 'welcome-image.jpg' with your actual image file name

  // Send the photo with the welcome message as the caption
  await ctx.replyWithPhoto({ source: imagePath }, { caption: welcomeMessage });
});

// Detect "fry me" and move roasting to DMs
bot.on("text", async (ctx) => {
  if (ctx.chat.type === "supergroup" || ctx.chat.type === "group") {
    if (ctx.message.text.toLowerCase() === "fry me") {
      ctx.reply(`🔥 Alright ${ctx.from.first_name}, check your DM with bated breath.`);
      try {
        await bot.telegram.sendMessage(ctx.from.id, "Please enter your Solana wallet address willfully. 😈");
      } catch (error) {
        ctx.reply("I can't DM you yet! Please start a chat with me first.");
      }
    }
  } else {
    // Handling DMs with the bot
    const walletAddress = ctx.message.text.trim();
    ctx.reply("If I die in here, clear my search history and tell my mom I was cool.... 🔍");

    const balance = await getSolBalance(walletAddress);
    const roastMessage = generateRoast(balance);

    ctx.reply(roastMessage);
  }
});

// Start command with custom DM message
bot.start((ctx) => {
  if (ctx.chat.type === "private") {
    ctx.reply("You asked for it! ...so this is on you. Please enter your Solana wallet address willfully.");
  } else {
    ctx.reply("Hey! I only roast in private. Type *fry me* in the group, and I'll DM you.");
  }
});

// Launch bot
bot.launch();
console.log("Bot is running...");