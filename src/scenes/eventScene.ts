import {Scene, SceneFlavoredContext} from "grammy-scenes";
import bot, {BotContext} from "../bot.ts";
import {EVENT_LABELS, SCENE} from "../types/models.ts";
import {unknownCommandText} from "./sceneUtils.ts";
import {KandinskyServices} from "../services/KandinskyServices.ts";
import {InputFile, InputMediaBuilder} from "grammy";
import {setupKeyboard} from "../bot/setupBotKeyboards.ts";
import {GigaChatServices} from "../services/GIgaChatServices.ts";
import {IGigaChatMessages} from "../types/gigaModels.ts";
import {IPropsGenerate} from "../types/kandinskyModels.ts";
import {eventDataBase, userDataBase} from "../bootstrap.ts";

const CANCEL = ['Начать заново']
const EVENT_THEME = ['Звездные войны', 'Гарри Поттер', 'Крокодил Гена']
const GEN_ANSWERS = ['Продолжить', 'Сгенерировать заново', 'Изменить данные']
const ANO_ANSWER = ['Указать', 'Не указывать']
const KANDINSKY_PROMPT = {
    'Звездные войны': 'Валентинка с розовыми сердечками в стиле "Звездные Войны" с Мастером Йодой на фоне рабочего офиса, на заднем плане kanban доска, на стене висит пазл',
    'Гарри Поттер': 'Валентинка с розовыми сердечками в стиле "Гарри Поттер и философский камень", Гарри Поттер варит зелье на фоне рабочего офиса, на заднем плане kanban доска, на стене висит пазл',
    'Крокодил Гена': 'Валентинка с розовыми сердечками в стиле советского мультика, Чебурашка стоит на фоне рабочего офиса, на заднем плане kanban доска, на стене висит пазл'
} as const;

export const eventScene = new Scene<BotContext>(SCENE.EVENT)

eventScene.always().do(async (ctx) => {
        await unknownCommandText(ctx)
})

eventScene.always().setup((scene) => {
    /**
     * Hears
     */
    scene.hears('Начать заново', async (ctx) => {
        ctx.scene.goto(EVENT_LABELS.CHOOSE_EVENT_THEME)
    })
    /**
     * On
     */

    /**
     * Command
     */
})

eventScene.label(EVENT_LABELS.START).step(async (ctx) => {
    await ctx.reply('Поздравьте свою вторую половинку с помощью искусственного интеллекта Kandinsky и Giga Chat!')
})

eventScene.label(EVENT_LABELS.CHOOSE_EVENT_THEME).step(async (ctx) => {
    const board = setupKeyboard([...EVENT_THEME, ...CANCEL])
    await ctx.reply('Выберите стиль в котором вы хотели бы поздравить', {
        reply_markup: {
            ...board,
            resize_keyboard: true,
            remove_keyboard: true
        }
    })
})

eventScene.wait(EVENT_LABELS.WAIT_CHOOSE_THEME).on('message:text', async (ctx) => {
    if (!EVENT_THEME.includes(ctx.message.text)) {
        const board = setupKeyboard([...EVENT_THEME, ...CANCEL])
        await ctx.reply('Пожалуйста, выберите один из вариантов', {
            reply_markup: {
                ...board,
                resize_keyboard: true
            }
        })
        return;
    }
    const keyboard = setupKeyboard(CANCEL)

    ctx.session.event.theme = ctx.message.text
    await ctx.reply(`Вы выбрали тему ${ctx.message.text}`, {
        reply_markup: {
            ...keyboard,
            resize_keyboard: true
        }
    })
    ctx.scene.resume()
})

eventScene.label(EVENT_LABELS.CHOOSE_NAME).step(async (ctx) => {
    await ctx.reply('Введите имя, кого следует поздравить')
})

eventScene.wait(EVENT_LABELS.WAIT_CHOOSE_NAME).on('message:text', async (ctx) => {
    const board = setupKeyboard(CANCEL)

    ctx.session.event.name = ctx.message.text
    await ctx.reply(`Поздравление для ${ctx.message.text}`, {
        reply_markup: {
            ...board,
            resize_keyboard: true,
            one_time_keyboard: true
        }
    })
    ctx.scene.resume()
})

eventScene.label(EVENT_LABELS.START_PROMPT_TEXT).step(async (ctx) => {
    await ctx.reply('Опишите, за что вы цените свою половинку, начиная с "Я ценю тебя за"')
})

eventScene.wait(EVENT_LABELS.WAIT_PROMPT_TEXT).on('message:text', async (ctx) => {
    if (!ctx.message.text.startsWith('Я ценю тебя за')) {
        await ctx.reply('Пожалуйста, начните с "Я ценю тебя за"')
        return;
    }
    const board = setupKeyboard(CANCEL)

    ctx.session.event.prompt = ctx.message.text
    await ctx.reply(`Отлично, ваш запрос: ${ctx.message.text}`, {
        reply_markup: {
            ...board,
            one_time_keyboard: true,
            remove_keyboard: true,
            resize_keyboard: true
        }
    })
    ctx.scene.resume()
})

eventScene.label(EVENT_LABELS.GET_AI_RESPONSE).step(async (ctx) => {
    if (!ctx.session.event.theme) {
        const someErrorBoard = setupKeyboard(CANCEL)
        await ctx.reply('Что-то пошло не так, начните заново', {
            reply_markup: {
                ...someErrorBoard,
                one_time_keyboard: true,
            }
        })
        return;

    }
    await ctx.reply('Запрос на генерацию отправлен, ожидайте ответа!', {
        reply_markup: {
            remove_keyboard: true
        }
    })
    const theme = ctx.session.event.theme as keyof typeof KANDINSKY_PROMPT;
    let kandinskyData: IPropsGenerate = {
        prompt: KANDINSKY_PROMPT[theme],
        style: 'DEFAULT',
    }
    const GIGA_PROMPT = {
        'Звездные войны': `Представь, что ты Магистр Йода из "Звездных Войн" и переделай текст для ${ctx.session.event.name} "${ctx.session.event.prompt}" используя знаменитые фразы Магистра Йоды`,
        'Гарри Поттер': `Представь, что ты эльф Добби из фильма Гарри Поттер и переделай текст для ${ctx.session.event.name} "${ctx.session.event.prompt}" используя цитаты из фильма Гарри Поттер`,
        'Крокодил Гена': `Представь, что ты Чебурашка и переделай текст для ${ctx.session.event.name} "${ctx.session.event.prompt}" используя цитаты Чебурашки`
    }


    const gigaChatData: IGigaChatMessages[] = [
        {
            role: 'system',
            content: 'Твоя роль в поздравлении человека, тебе предоставят имя человека и текст поздравления, и тебе нужно переделать текст поздравления в стиле в котором тебя попросят. Важно, в твоем ответе должно содержатся имя кого нужно поздравить, а так же ты должен будешь определить пол человека по имени и правильно склонять слова в зависимости от пола'
        },
        {
            role: 'user',
            content: GIGA_PROMPT[theme]
        }
    ]

    Promise.all([
        KandinskyServices.getKandinsky(kandinskyData),
        GigaChatServices.getGigaChat({messages: gigaChatData})
    ]).then(async (result) => {
        const board = setupKeyboard(GEN_ANSWERS)
        const [kandinsky, giga] = result
        const [photo] = kandinsky

        if (giga?.choices[0].message && photo) {
            ctx.session.event.picture = photo as Buffer
            ctx.session.event.prompt = giga.choices[0].message.content

            const photoMessage = await ctx.replyWithPhoto(new InputFile(photo))
            await ctx.reply(`${giga.choices[0].message.content}`)
            ctx.session.event.file_id = photoMessage.photo.find((photo) => photo.width === 1024)?.file_id
            await ctx.reply('Вам нравится? Или что-то переделать?', {
                reply_markup: {
                    ...board,
                    one_time_keyboard: true,
                    remove_keyboard: true
                }
            })
        } else {
            const errorBoard = setupKeyboard(CANCEL)
            await ctx.reply('Что-то пошло не так, пожалуйста попробуйте снова!', {
                reply_markup: {
                    one_time_keyboard: true,
                    resize_keyboard: true,
                    remove_keyboard: true,
                    ...errorBoard
                }
            })
            return;
        }
    })
})

eventScene.wait(EVENT_LABELS.WAIT_GENERATION).on('message:text', async (ctx) => {
    if (ctx.message.text === 'Продолжить') {
        ctx.scene.resume()
        return;
    }
    if (ctx.message.text === 'Сгенерировать заново') {
        ctx.scene.goto(EVENT_LABELS.GET_AI_RESPONSE)
        return;
    }
    if (ctx.message.text === 'Изменить данные') {
        ctx.scene.goto(EVENT_LABELS.CHOOSE_EVENT_THEME)
        return;
    }
    await ctx.reply('Пожалуйста, дождитесь генерации!')
})


eventScene.label(EVENT_LABELS.CHOOSE_LOGIN).step(async (ctx) => {
    await ctx.reply('Введите логин в Telegram без "@", кому хотите отправить открытку')
})

eventScene.wait(EVENT_LABELS.WAIT_LOGIN).on('message:text', async (ctx) => {
    if (ctx.message.text.startsWith('@')) {
        await ctx.reply('Пожалуйста, введите логин без "@"')
        return;
    }
    ctx.session.event.login = ctx.message.text
    ctx.scene.resume()
})

eventScene.label(EVENT_LABELS.WITH_ANONYMITY).step(async (ctx) => {
    const board = setupKeyboard([...ANO_ANSWER, ...CANCEL])
    await ctx.reply('Хотели бы вы указать от кого будет открытка?', {
        reply_markup: {
            ...board,
            one_time_keyboard: true,
            remove_keyboard: true,
            resize_keyboard: true
        }
    })
})

eventScene.wait(EVENT_LABELS.WAIT_ANONYMITY_ANSWER).on('message:text', async (ctx) => {
    if (ANO_ANSWER.includes(ctx.message.text)) {
        ctx.session.event.isShowWhoSend = ctx.message.text === 'Указать'
        ctx.session.event.author = ctx.message.from.username
        ctx.scene.resume()
    } else {
        const board = setupKeyboard([...ANO_ANSWER, ...CANCEL])

        await ctx.reply('Пожалуйста, выберите из двух вариантов!', {
            reply_markup: {
                ...board,
                one_time_keyboard: true,
                remove_keyboard: true,
                resize_keyboard: true
            }
        })
    }
})

eventScene.label(EVENT_LABELS.SEND_REQUEST).step(async (ctx) => {
    const userLogin: number | undefined = userDataBase.JSON()[ctx.session.event.login!]
    if (userLogin) {
        await ctx.reply(`Отлично! Открытка отправлена пользователю ${ctx.session.event.login}`)
        await ctx.api.sendPhoto(userLogin, new InputFile(ctx.session.event.picture!))
        await ctx.api.sendMessage(userLogin, ctx.session.event.prompt!)
        ctx.session.event.isShowWhoSend && await ctx.api.sendMessage(userLogin, `От пользователя ${ctx.session.event.author}`)
    } else {
        await ctx.reply(`Не получилось отправить открытку!\n\nПредложите ${ctx.session.event.login} перейти в личный чат со мной и ввести команду /get_cards, что бы получить её!`)
    }
    const user = eventDataBase.get(ctx.session.event.login as string) ?? []
    const newUserData = {
        file_id: ctx.session.event.file_id,
        text: ctx.session.event.prompt,
        isMessageSend: !!userLogin,
        from: ctx.session.event.author,
        isShowAuthor: ctx.session.event.isShowWhoSend
    }

    let newData = [...user, newUserData];
    eventDataBase.set(ctx.session.event.login as string, newData)
})

eventScene.label(EVENT_LABELS.END).step(async (ctx) => {
    await ctx.reply('Генерация окончена! Если хотите отправить новую открытку, просто введите /event')
    ctx.scene.exit()
})