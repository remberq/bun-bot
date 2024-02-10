import bot from './bot.ts'
import {setupBotCommandsListeners} from "./bot/setupBotCommands.ts";
import {setupBotHearsListeners} from "./bot/setupBotHears.ts";
import {setupBotCatchListener} from "./bot/setupBotCatchListener.ts";
import JSONdb from "simple-json-db";

export const userDataBase = new JSONdb<number>('userDataBase.json');
export const eventDataBase = new JSONdb('eventDataBase.json');

const startBot = () => {
    console.log('Bot is running....!')
    void bot.start()
}

export const botSetup = () => {
    setupBotCommandsListeners(bot)
    setupBotHearsListeners(bot)
    setupBotCatchListener(bot)

    bot.hears('SendAll', async (ctx) => {
        const data = Object.values(userDataBase.JSON()) ?? []
        data.forEach((member) => {
            ctx.api.sendMessage(member, 'Hii')
        })
    })

    startBot()
}

void botSetup()