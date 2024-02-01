import bot from './bot.ts'
import {setupBotCommands} from "../botCommands.ts";
import {GrammyError, HttpError, InputFile} from "grammy";
import {KandinskyServices} from "./services/KandinskyServices.ts";

const startBot = () => {
    console.log('Bot is running...!')
    void bot.start()
}
export const botSetup = () => {
    setupBotCommands()
    bot.hears(/p:/gi, async (ctx) => {
        const prompt = ctx.message?.text?.split(':')[1].trim() ?? ''
        void ctx.reply('Ваш запрос обрабатывается...')
        const picture = await KandinskyServices.getKandinsky(prompt, 1)
        void ctx.replyWithPhoto(new InputFile(picture))
        return ctx.reply('Your prompt is: ' + prompt)
    })

    bot.reaction("🎉", (ctx) => ctx.reply("whoop whoop"));

    bot.catch((err) => {
        const ctx = err.ctx;
        console.error(`Error while handling update ${ctx.update.update_id}:`);
        const e = err.error;
        if (e instanceof GrammyError) {
            console.error("Error in request:", e.description, e);
        } else if (e instanceof HttpError) {
            console.error("Could not contact Telegram:", e);
        } else {
            console.error("Unknown error:", e?.message);
        }
    });

    startBot()
}

botSetup()