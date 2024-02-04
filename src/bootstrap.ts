import bot from './bot.ts'
import {setupBotCommandsListeners} from "./bot/setupBotCommands.ts";
import {setupBotHearsListeners} from "./bot/setupBotHears.ts";
import {setupBotCatchListener} from "./bot/setupBotCatchListener.ts";

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