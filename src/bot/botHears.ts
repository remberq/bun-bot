import bot from "../bot.ts";

bot.hears("HI", async (ctx) => {
    void ctx.reply('Hi')
})

