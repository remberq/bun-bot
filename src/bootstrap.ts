import bot from './bot.ts'
import {setupBotCommandsListeners} from "./bot/setupBotCommands.ts";
import {setupBotHearsListeners} from "./bot/setupBotHears.ts";
import {setupBotCatchListener} from "./bot/setupBotCatchListener.ts";
import JSONdb from "simple-json-db";
import {handleWriteChatMemberInDB, isThisChatMemberHasNotInDB} from "./scenes/sceneUtils.ts";

export const userDataBase = new JSONdb('userDataBase.json');
export const eventDataBase = new JSONdb('eventDataBase.json');

const startBot = () => {
    console.log('Bot is running....!')
    void bot.start()
}

export const botSetup = () => {
    setupBotCommandsListeners(bot)
    setupBotHearsListeners(bot)
    setupBotCatchListener(bot)

    bot.on('message').filter(isThisChatMemberHasNotInDB, handleWriteChatMemberInDB)

    startBot()
}

void botSetup()