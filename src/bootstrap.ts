import bot from './bot.ts'
import {setupBotCommandsListeners} from "./bot/setupBotCommands.ts";
import {setupBotHearsListeners} from "./bot/setupBotHears.ts";
import {setupBotCatchListener} from "./bot/setupBotCatchListener.ts";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

const startBot = () => {
    console.log('Bot is running...!')
    void bot.start()
}
export const botSetup = () => {
    setupBotCommandsListeners(bot)
    setupBotHearsListeners(bot)
    setupBotCatchListener(bot)

    startBot()
}

botSetup()