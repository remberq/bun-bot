import { Scene } from "grammy-scenes"

import { BotContext } from "../bot"
import {InlineKeyboard, InputFile, Keyboard} from "grammy";
import {IPropsGenerate, KandinskyServices} from "../services/KandinskyServices.ts";
import {setupInlineKeyboard} from "../bot/botKeyboardSetup.ts";

export const mainScene = new Scene<BotContext>("main")

mainScene.step(async (ctx) => {
    await ctx.reply("Введите ваш запрос:")
})

// As the flow comes to wait(), the execution will stop.
// Next Telegram updates will be passed to the inner middleware.
// The inner middleware should call ctx.scene.resume() to proceed to the next scene step.
// Make sure to use unique label in each wait() block.
mainScene.wait("prompt").on("message:text", async (ctx) => {
    ctx.session.prompt = ctx.message.text
    ctx.scene.resume()
})

mainScene.step(async (ctx) => {
    const inline = new InlineKeyboard()
        .text('1', JSON.stringify(1))
        .text('2', JSON.stringify(2))
        .row()
        .text('3', JSON.stringify(3))
        .text('4', JSON.stringify(4))

    await ctx.reply("Сколько картинок показать?", {
        reply_markup: {
            ...inline,
            remove_keyboard: true
        }
    })
})

mainScene.wait('count').setup((scene) => {
    scene.on('callback_query:data', async (ctx) => {
        ctx.session.count = JSON.parse(ctx.callbackQuery.data)
        ctx.scene.resume()
        void ctx.answerCallbackQuery()
    })
})

// Add more steps...
mainScene.step(async (ctx) => {
    const styles = await KandinskyServices.getStyles()
    const inline = setupInlineKeyboard(styles, 2)

    await ctx.reply("В каком стиле?", {
        reply_markup: {
            ...inline,
            remove_keyboard: true
        }
    })
})

mainScene.wait("style").on("callback_query:data", async (ctx) => {
    ctx.session.style = ctx.callbackQuery.data
    const inline = new InlineKeyboard()
        .text('Отправить запрос', 'GET')
        .text('Отмена','CANCEL')

    await ctx.reply('Выберите вариант', {
        reply_markup: {
            ...inline,
            remove_keyboard: true
        },
    })
    // Proceed to the next step.
    ctx.scene.resume()
    void ctx.answerCallbackQuery()
})

mainScene.wait('result').setup((scene) => {
    scene.on('callback_query:data', async (ctx) => {
        const data = ctx.callbackQuery.data
        if (data === 'CANCEL') {
            void ctx.reply('Запрос отменен!')
            void ctx.answerCallbackQuery()
            return;
        }
        void ctx.answerCallbackQuery()
        void ctx.reply('Ваш запрос обрабатывается...')
        const picture = await KandinskyServices.getKandinsky({
            prompt: ctx.session.prompt,
            style: ctx.session.style,
            imageCount: ctx.session.count
        })
        void ctx.replyWithPhoto(new InputFile(picture))
    })
})

// // Mark position in the scene to be able to jump to it (see below).
// mainScene.label("start")
//
// // A scene may unconditionally call a nested scene.
// // See sample captcha implementation below.
// mainScene.call("captcha")

// Please add step label for the first step after call()
// mainScene.label("after_captcha").step(async (ctx) => {
//     await ctx.reply(`Please choose:`, {
//         reply_markup: {
//             inline_keyboard: [
//                 [
//                     { text: "Start over", callback_data: "start" },
//                     { text: "Add item", callback_data: "add_item" },
//                     { text: "Exit", callback_data: "exit" },
//                 ],
//             ],
//         },
//     })
// })
//
// mainScene.wait("menu").on("callback_query:data", async (ctx) => {
//     await ctx.answerCallbackQuery()
//     const choice = ctx.callbackQuery.data
//     if (choice === "start") {
//         // Jump to the label marked above.
//         ctx.scene.goto("start")
//     } else if (choice === "add_item") {
//         // Conditionally call a nested scene.
//         // Implies automatic resume after the nested scene completes.
//         ctx.scene.call("add_item")
//     } else if (choice === "exit") {
//         // Exit scene, don't call next middleware.
//         ctx.scene.exit()
//     }
// })

mainScene.step((ctx) => ctx.reply(`Main scene finished`))