import {Scene} from "grammy-scenes";
import {BotContext} from "../bot.ts";
import {GigaChatServices} from "../services/GIgaChatServices.ts";
import {unknownCommandText} from "./sceneUtils.ts";
import {COMMAND, GIGA_LABELS, SCENE, SLASH_COMMAND} from "../types/models.ts";
import {setupKeyboard} from "../bot/setupBotKeyboards.ts";
import {IGigaChatMessages} from "../types/gigaModels.ts";

const KEYBOARD_TEXT = ['В начало','Завершить', 'Сменить роль']
export const gigaChatScene = new Scene<BotContext>(SCENE.GIGA_CHAT)

gigaChatScene.always().do(async (ctx) => {
    await unknownCommandText(ctx)
})

gigaChatScene.always().setup(async (scene) => {
    /**
     * Hears
     */
    scene.hears('В начало', async (ctx) => {
        ctx.scene.goto(GIGA_LABELS.START)
    })
    scene.hears('Завершить', async (ctx) => {
        ctx.scene.goto(GIGA_LABELS.END)
    })
    scene.hears('Сменить роль', async (ctx) => {
        ctx.scene.goto(GIGA_LABELS.CHANGE_ROLE)
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
    scene.command(COMMAND.KANDINSKY, async (ctx) => {
        ctx.scene.goto(GIGA_LABELS.CALL_KANDINSKY)
    })
    scene.command(COMMAND.HELP, async (ctx) => {
        await ctx.reply('HELP')
    })
    scene.command(COMMAND.END_SCENE, async (ctx) => {
        ctx.scene.goto(GIGA_LABELS.END)
    })
})

gigaChatScene.label(GIGA_LABELS.START).step(async (ctx) => {
    await ctx.reply('Добро пожаловать в чат с API GigaChat! ')
})

gigaChatScene.label(GIGA_LABELS.CHANGE_ROLE).step(async (ctx) => {
    const board = setupKeyboard(KEYBOARD_TEXT)
    await ctx.reply("В какой роли мне следует отвечать?", {
        reply_markup: {
            ...board,
        }
    })
})

gigaChatScene.wait(GIGA_LABELS.PROMPT_ROLE).on("message:text", async (ctx) => {
    if (ctx.message.text.startsWith('/')) {
        return;
    }

    const roleContent: IGigaChatMessages = {
        role: 'system',
        content: ctx.message.text
    };
    ctx.session.gigaRole = ctx.message.text
    const [_role, ...restMessages] = ctx.session.gigaMessages
    ctx.session.gigaMessages = [roleContent, ...restMessages]
    ctx.scene.resume();
})


gigaChatScene.label(GIGA_LABELS.PROMPT_TEXT).step(async (ctx) => {
    await ctx.reply(`Принято! Теперь я постараюсь отвечать в роли: ${ctx.session.gigaRole}`)
})

gigaChatScene.label(GIGA_LABELS.QUESTION_PROMPT).step(async (ctx) => {
    const board = setupKeyboard(KEYBOARD_TEXT)
    await ctx.reply("Что бы вы хотели обсудить?", {
        reply_markup: {
            ...board,
        }
    })
})


gigaChatScene.wait(GIGA_LABELS.WAIT_PROMPT).setup(async (scene) => {
    scene.on("message:text", async (ctx) => {
        if (ctx.message.text.startsWith('/')) {
            return;
        }
        const userRoleContent: IGigaChatMessages =  {
            role: 'user',
            content: ctx.message.text
        }
        ctx.session.gigaMessages = [...ctx.session.gigaMessages, userRoleContent]
        const botThinkMessage = await ctx.reply('Придумываю ответ...')
        try {
            const response = await GigaChatServices.getGigaChat({
                messages: ctx.session.gigaMessages,
            })
            if (response?.choices[0].message) {
                await ctx.api.deleteMessage(botThinkMessage.chat.id, botThinkMessage.message_id)
                void ctx.reply(`${response.choices[0].message.content}`, {
                    reply_markup: {
                        ...setupKeyboard(KEYBOARD_TEXT),
                    },
                    parse_mode: 'Markdown',
                    reply_to_message_id: ctx.message.message_id
                })
                ctx.session.gigaMessages = [...ctx.session.gigaMessages, response?.choices[0].message]
            } else {
                throw Error('Ошибка в запросе')
            }
        } catch (err) {
            await ctx.api.deleteMessage(botThinkMessage.chat.id, botThinkMessage.message_id)
            await ctx.reply('Произошла ошибка, отправьте сообщение снова!')
        }
    })
})

gigaChatScene.label(GIGA_LABELS.END).step(async (ctx) => {
    await ctx.reply(`Чат завершен! Для начала нового диалога введите команду 
        - ${SLASH_COMMAND.GIGA_CHAT}`, {
        reply_markup: {
            remove_keyboard: true
        }
    })
    ctx.scene.exit()
})

gigaChatScene.label(GIGA_LABELS.CALL_KANDINSKY).call(SCENE.KANDINSKY)
