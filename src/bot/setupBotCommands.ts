import {BotContext} from "../bot.ts";
import {Api, Bot, RawApi} from "grammy";
import {COMMAND, SCENE, SLASH_COMMAND} from "../types/models.ts";

interface IBotCommandsArray {
    command: COMMAND;
    cb: (ctx: BotContext) => void;
}

/**
 * Добавляем общие обработчики команд для бота тут
 */
const botCommandsArrays: IBotCommandsArray[] = [
    {
        command: COMMAND.KANDINSKY,
        cb: async (ctx) => {
            await ctx.scenes.enter(SCENE.KANDINSKY)
        }
    },
    {
        command: COMMAND.START,
        cb: async (ctx) => {
            await ctx.reply('Добро пожаловать в чат-бот GigaChat & Kandinsky!')
            await ctx.reply(`Доступны следующие команды:
        
          -- ${SLASH_COMMAND.GIGA_CHAT}    --  Начать чат с GigaChat
          
          -- ${SLASH_COMMAND.KANDINSKY}   --  Начать чат с Kandinsky
          
          -- ${SLASH_COMMAND.END_SCENE}              --  Окончание чата во время общения с ботом`)
        }
    },
    {
        command: COMMAND.GIGA_CHAT,
        cb: async (ctx) => {
            await ctx.scenes.enter(SCENE.GIGA_CHAT)
        }
    },
]

/**
 * Регистрируем команды для бота тут
 */
export const setupBotCommandsListeners = (bot: Bot<BotContext, Api<RawApi>>) => {
    botCommandsArrays.forEach(({command, cb}) => {
        bot.command(command, cb)
    })
}
