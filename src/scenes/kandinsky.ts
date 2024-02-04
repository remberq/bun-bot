import { Scene } from "grammy-scenes"
import {BotContext} from "../bot"
import { InputFile, InputMediaBuilder} from "grammy";
import { KandinskyServices} from "../services/KandinskyServices.ts";
import {setupKeyboard} from "../bot/setupBotKeyboards.ts";
import { unknownCommandText} from "./sceneUtils.ts";
import {COMMAND, KANDINSKY_LABELS, SCENE, SLASH_COMMAND} from "../types/models.ts";

const END_CHAT = ['Завершить магию']
const NEW_REQUEST = ['Продолжить магию',...END_CHAT]

export const kandinskyScene = new Scene<BotContext>(SCENE.KANDINSKY)

kandinskyScene.always().setup(async (scene) => {
    /**
     * Hears
     */
    scene.hears('Завершить магию', async (ctx) => {
        ctx.session.controller?.abort()
        ctx.scene.goto(KANDINSKY_LABELS.END)
    })
    scene.hears('Продолжить магию', async (ctx) => {
        ctx.scene.goto(KANDINSKY_LABELS.WAIT_REQUEST)
    })
    /**
     * On
     */
    scene.on('message:sticker', async (ctx) => {
        await ctx.reply("Только не стикеры, пожалуйста, только не они!!!")
    })
    /**
     * Command
     */
    scene.command(COMMAND.END_SCENE, async (ctx) => {
        ctx.scene.goto(KANDINSKY_LABELS.END)
    })
    scene.command(COMMAND.GIGA_CHAT, async (ctx) => {
        ctx.scene.goto(KANDINSKY_LABELS.CALL_GIGA)
    })
})
kandinskyScene.always().do(async (ctx) => {
    await unknownCommandText(ctx)
})

kandinskyScene.label(KANDINSKY_LABELS.START).step(async (ctx) => {
    await ctx.reply(`Добро пожаловать в чат с API Kandinsky!`)
})

kandinskyScene.label(KANDINSKY_LABELS.WAIT_REQUEST).step(async (ctx) => {
    const board = setupKeyboard(END_CHAT)

    await ctx.reply("Введите ваш запрос:", {
        reply_markup: {
            ...board,
            one_time_keyboard: true
        }
    })
})
kandinskyScene.wait(KANDINSKY_LABELS.PROMPT_TEXT).on("message:text", async (ctx) => {
    ctx.session.prompt = ctx.message.text
    ctx.scene.resume()
})

kandinskyScene.label(KANDINSKY_LABELS.WAIT_PROMPT).step(async (ctx) => {
    const styles = await KandinskyServices.getStyles()
    const keyboard = setupKeyboard([...styles.map((style) => style.title), ...END_CHAT])
    ctx.session.allStyle = styles.map((style) => ({name: style.name, title: style.title}))

    await ctx.reply("В каком стиле?", {
        reply_markup: {
            ...keyboard,
            one_time_keyboard: true,
        }
    })
})

kandinskyScene.wait(KANDINSKY_LABELS.WAIT_STYLE).on('message:text', async (ctx) => {
    const styleTitleArray = ctx.session.allStyle?.map((style) => style.title) ?? []

    if (!styleTitleArray.includes(ctx.message.text)) {
        await ctx.reply('Пожалуйста, введите способ из предложенных вариантов')
        return;
    }

    ctx.scene.resume()
})


kandinskyScene.label(KANDINSKY_LABELS.PROMPT_STYLE).step(async (ctx) => {
    const thinkMessage = await ctx.reply('Добавил в очередь на генерацию изображения. Пожалуйста, дождитесь ответа!', {
        reply_markup: {
            remove_keyboard: true
        }
    })
    const styleName = ctx.session.allStyle?.find((style) => style.title === ctx.message?.text)
    KandinskyServices.getKandinsky({
        prompt: ctx.session.prompt,
        style: styleName?.name,
    }).then(async (picBuffer) => {
        const mediaGroup = picBuffer.map((pic) => {
            return InputMediaBuilder.photo(new InputFile(pic))
        })
        await ctx.api.deleteMessage(thinkMessage.chat.id, thinkMessage.message_id)
        await ctx.replyWithMediaGroup(mediaGroup)
        await ctx.reply(`Ваш запрос: ${ctx.session.prompt} в стиле: ${styleName?.title} - готов!`)
        await ctx.reply('Давайте еще что-нибудь нарисуем?', {
            reply_markup: {
                ...setupKeyboard(NEW_REQUEST),
                one_time_keyboard: true
            }
        })
    })
})

kandinskyScene.wait(KANDINSKY_LABELS.WAIT_GEN).on('message:text', async (ctx) => {
    if (ctx.message.text) {
        await ctx.reply('Пожалуйста, дождитесь генерации ответа!')
    }
})

kandinskyScene.label(KANDINSKY_LABELS.END).step(async (ctx) => {
    await ctx.reply(`Чат завершен! Для начала нового диалога введите команду 
        - ${SLASH_COMMAND.KANDINSKY}`, {
        reply_markup: {
            remove_keyboard: true
        }
    })
    ctx.scene.exit()
})

kandinskyScene.label(KANDINSKY_LABELS.CALL_GIGA).call(SCENE.GIGA_CHAT)
