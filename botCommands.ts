import bot from "./src/bot.ts";
import {CommandContext, Context, InlineKeyboard, InputFile, Keyboard} from "grammy";
import {GigaChatServices} from "./src/services/GIgaChatServices.ts";
import {KandinskyServices} from "./src/services/KandinskyServices.ts";

interface IBotCommandsArray {
    command: string;
    cb: (ctx: CommandContext<Context>) => void;
}

/**
 * Добавляем команды для бота тут
 */
const botCommandsArrays: IBotCommandsArray[] = [
    // {
    //     command: 'start',
    //     cb: (ctx) => {
    //         void ctx.reply('"Hi! Send /enter"')
    //     }
    // },
    {
        command: 'help',
        cb: async (ctx) => {
            console.log(ctx.message?.text)
            void ctx.reply('Доступны следующие команды /start, /help, /kandinsky')
        }
    },
    {
        command: 'enter',
        cb: async (ctx) => {
            // const picture = await KandinskyServices.getKandinsky('Лиса')
            // void ctx.replyWithPhoto(new InputFile(picture))
            void ctx.reply('Введите ваш запрос начиная с prompt:')
        }
    }
]

/**
 * Регистрируем команды для бота тут
 */
export const setupBotCommands = () => {
    botCommandsArrays.forEach(({command, cb}) => {
        bot.command(command, cb)
    })
}