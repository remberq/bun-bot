import {Scene} from "grammy-scenes";
import {BotContext} from "../bot.ts";
import {GET_CARDS_LABELS, SCENE} from "../types/models.ts";
import {eventDataBase, userDataBase} from "../bootstrap.ts";
import {IEventDataBase} from "../types/databaseModels.ts";
import {Keyboard} from "grammy";

const CONTACT_REQUEST = ['Предоставить контакт', 'Отказаться']
export const getCardsScene = new Scene<BotContext>(SCENE.GET_CARDS)

getCardsScene.label(GET_CARDS_LABELS.START).step(async (ctx) => {
    const userId = ctx.message?.from.id
    if (userId) {
        const {phone, nick, isContactGet} = userDataBase.get(`${userId}`)
        const userInfoData = isContactGet ? phone : nick
        const userGiftCards: IEventDataBase[] = eventDataBase.get(`${userInfoData}`) ?? []

        if (userGiftCards.length) {
            let dataArray: IEventDataBase[] = [];

            for (const card of userGiftCards) {
                const newCard = {...card}
                await ctx.api.sendPhoto(userId, newCard.file_id)
                await ctx.api.sendMessage(userId, newCard.text)
                newCard.isShowAuthor && await ctx.api.sendMessage(userId, `От ${newCard.from}`)
                newCard.isMessageSend = true
                dataArray.push(newCard)
            }

            eventDataBase.set(userInfoData, dataArray)
            ctx.scene.goto(GET_CARDS_LABELS.END)
        } else {
            if (!phone) {
                const board = new Keyboard().requestContact('Предоставить контакт').row().text('Отказаться').resized()
                await ctx.reply('Для вас пока что нет открыток! ' +
                    'Быть может, ваш коллега предоставил ваш телефон в качестве адресата, давайте поищем?', {
                    reply_markup: {
                        ...board,
                        one_time_keyboard: true,
                    }
                })
            } else {
                await ctx.reply('Для вас пока что нет открыток!')
                ctx.scene.goto(GET_CARDS_LABELS.END)
            }
        }
    } else {
        await ctx.reply('Не найден пользователь!')
        ctx.scene.goto(GET_CARDS_LABELS.END)
    }
})

getCardsScene.wait(GET_CARDS_LABELS.REQUEST).setup((scene) => {
    scene.on('message:contact', async (ctx) => {
        const {phone_number, user_id, first_name } = ctx.message.contact
        const userData = userDataBase.JSON()[`${user_id}`]

        userDataBase.set(`${user_id}`, {...userData, phone: phone_number, isContactGet: true})
        console.log(`Контактные данные пользователя ${first_name} успешно записаны!`)
        await ctx.reply('Данные записаны!', {
            reply_markup: {
                remove_keyboard: true
            }
        })
        ctx.scene.goto(GET_CARDS_LABELS.START)
        return;
    })
    scene.hears('Отказаться', async (ctx) => {
        ctx.scene.goto(GET_CARDS_LABELS.END)
    })
    scene.on('message:text', async (ctx) => {
        if (!CONTACT_REQUEST.includes(ctx.message.text)) {
            await ctx.reply('Пожалуйста, выберите один из вариантов')
            return;
        }
    })
})

getCardsScene.label(GET_CARDS_LABELS.END).step(async (ctx) => {
    console.log('Сцена окончена!')
})