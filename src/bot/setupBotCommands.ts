import {BotContext} from "../bot.ts";
import {Api, Bot, RawApi} from "grammy";
import {COMMAND, SCENE, SLASH_COMMAND} from "../types/models.ts";
import {userDataBase} from "../bootstrap.ts";

interface IBotCommandsArray {
    command: COMMAND;
    cb: (ctx: BotContext) => void;
}

const dataBaseCheck = async (ctx: BotContext) => {
    const member = await ctx.getAuthor()
    if (member.user.id && !userDataBase.has(`${member.user.id}`)) {
        userDataBase.set(`${member.user.id}`, { nick: member.user.username, isContactGet: false })
        console.log(`Успешно записан в базу пользователь ${member.user.username} с chatID ${member.user.id}`)
    } else {
        console.log(`Пользователь ${member.user.id} уже есть в базе`)
    }

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
            await dataBaseCheck(ctx)

            await ctx.reply('Добро пожаловать в чат-бот GigaChat & Kandinsky!')
            await ctx.reply(`Доступны следующие команды:
        
          -- ${SLASH_COMMAND.GIGA_CHAT}    --  Начать чат с GigaChat
          
          -- ${SLASH_COMMAND.KANDINSKY}   --  Начать чат с Kandinsky
          
          -- ${SLASH_COMMAND.END_SCENE}              --  Окончание чата во время общения с ботом
          
          -- ${SLASH_COMMAND.EVENT}           --  Поздравьте своего коллегу
          
          -- ${SLASH_COMMAND.GET_CARDS}           --  Получить свои открытки
          `)
        }
    },
    {
        command: COMMAND.GIGA_CHAT,
        cb: async (ctx) => {
            await ctx.scenes.enter(SCENE.GIGA_CHAT)
        }
    },

]

const eventBotCommands: IBotCommandsArray[] = [
    {
        command: COMMAND.START,
        cb: async (ctx) => {
            await dataBaseCheck(ctx)

            await ctx.reply('Добро пожаловать в чат-бот GigaChat & Kandinsky!')
            await ctx.reply('Доступны следующие команды:' +
                '\n\n  -- /event          --  Поздравьте своего коллегу' +
                '\n\n  -- /get_cards   --  Получить свои открытки'
            )
        }
    },
    {
        command: COMMAND.EVENT,
        cb: async (ctx) => {
            await dataBaseCheck(ctx)
            await ctx.scenes.enter(SCENE.EVENT)
        }
    },
    {
        command: COMMAND.GET_CARDS,
        cb: async (ctx) => {
            await dataBaseCheck(ctx)
            await ctx.scenes.enter(SCENE.GET_CARDS)
        }
    },
]

/**
 * Регистрируем команды для бота тут
 */
export const setupBotCommandsListeners = (bot: Bot<BotContext, Api<RawApi>>) => {
    eventBotCommands.forEach(({command, cb}) => {
        bot.command(command, cb)
    })
}
