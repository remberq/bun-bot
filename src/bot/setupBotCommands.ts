import {BotContext} from "../bot.ts";
import {Api, Bot, RawApi} from "grammy";
import {COMMAND, SCENE, SLASH_COMMAND} from "../types/models.ts";
import {eventDataBase, userDataBase} from "../bootstrap.ts";
import {eventScene} from "../scenes/eventScene.ts";
import {IEventDataBase} from "../types/databaseModels.ts";

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
            const member = await ctx.getAuthor()
            if (member.user.username && !userDataBase.has(member.user.username)) {
                userDataBase.set(member.user.username, member.user.id)
                console.log(`Успешно записан в базу пользователь ${member.user.username} с chatID ${member.user.id}`)
            } else {
                console.log(`Пользователь ${member.user.username} уже есть в базе`)
            }

            await ctx.reply('Добро пожаловать в чат-бот GigaChat & Kandinsky!')
            await ctx.reply(`Доступны следующие команды:
        
          -- ${SLASH_COMMAND.GIGA_CHAT}    --  Начать чат с GigaChat
          
          -- ${SLASH_COMMAND.KANDINSKY}   --  Начать чат с Kandinsky
          
          -- ${SLASH_COMMAND.END_SCENE}              --  Окончание чата во время общения с ботом
          
          -- ${SLASH_COMMAND.EVENT}           --  Поздравьте свою половинку
          
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
            const member = await ctx.getAuthor()
            if (member.user.username && !userDataBase.has(member.user.username)) {
                userDataBase.set(member.user.username, member.user.id)
                console.log(`Успешно записан в базу пользователь ${member.user.username} с chatID ${member.user.id}`)
            } else {
                console.log(`Пользователь ${member.user.username} уже есть в базе`)
            }

            await ctx.reply('Добро пожаловать в чат-бот GigaChat & Kandinsky!')
            await ctx.reply(`Доступны следующие команды:
          
          -- ${SLASH_COMMAND.EVENT}                  --  Поздравьте свою половинку
          
          -- ${SLASH_COMMAND.GET_CARDS}           --  Получить свои открытки
          `)
        }
    },
    {
        command: COMMAND.EVENT,
        cb: async (ctx) => {
            await ctx.scenes.enter(SCENE.EVENT)
        }
    },
    {
        command: COMMAND.GET_CARDS,
        cb: async (ctx) => {
            const userLogin = ctx.message?.from.username ?? ''
            const userGiftCart: IEventDataBase[] = eventDataBase.get(userLogin) ?? []
            const userChatId = userDataBase.get(userLogin) ?? ''
            const newData = userGiftCart.filter((card) => !card.isMessageSend)

            if (newData.length) {
                let dataArray: IEventDataBase[] = [];

                for (const card of newData) {
                    await ctx.api.sendPhoto(userChatId, card.file_id)
                    await ctx.api.sendMessage(userChatId, card.text)
                    card.isShowAuthor && await ctx.api.sendMessage(userChatId, `От ${card.from}`)
                    dataArray.push({
                        ...card,
                        isMessageSend: true
                    })
                }

                eventDataBase.set(userLogin, dataArray)
            } else {
                await ctx.reply('Для вас нет непрочитанных открыток!')
            }
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
