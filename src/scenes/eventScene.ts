import {Scene} from "grammy-scenes";
import {BotContext} from "../bot.ts";
import {EVENT_LABELS, SCENE} from "../types/models.ts";
import {handleWriteChatMemberInDB, isThisChatMemberHasNotInDB, unknownCommandText} from "./sceneUtils.ts";
import {KandinskyServices} from "../services/KandinskyServices.ts";
import {InputFile} from "grammy";
import {setupKeyboard} from "../bot/setupBotKeyboards.ts";
import {GigaChatServices} from "../services/GIgaChatServices.ts";
import {IGigaChatMessages} from "../types/gigaModels.ts";
import {IPropsGenerate} from "../types/kandinskyModels.ts";
import {eventDataBase} from "../bootstrap.ts";

const CANCEL = ['Начать заново']
const EVENT_THEME = ['По-джедайски', 'По-старославѣнски', 'По-пацански']
const GEN_ANSWERS = ['Продолжить', 'Сгенерировать заново', 'Изменить данные']
const ANO_ANSWER = ['Указать', 'Не указывать']
const KANDINSKY_PROMPT = {
    'По-джедайски': 'Валентинка с розовыми сердечками в стиле звездных войн с Мастером Йодой, на фоне рабочего офиса, на заднем плане kanban доска, на стене розовые сердечки',
    'По-старославѣнски': 'Иллюстрация, изображающая сердечки, солнце и цветы в стиле славянских картин Максима Кулешовва сердечки в центре занимают главную роль',
    'По-пацански': 'Картинка подъездной стены с нацарапанным сердечком на ней, хулиганы'
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
    scene.on('message').filter(isThisChatMemberHasNotInDB, handleWriteChatMemberInDB)
    /**
     * Command
     */
})

eventScene.label(EVENT_LABELS.CHOOSE_EVENT_THEME).step(async (ctx) => {
    const board = setupKeyboard([...EVENT_THEME, ...CANCEL])
    await ctx.reply('Как вы бы хотели поздравить коллегу?', {
        reply_markup: {
            ...board,
            resize_keyboard: true,
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
    await ctx.reply(`Вы выбрали ${ctx.message.text}`, {
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
    ctx.session.event.name = ctx.message.text
    await ctx.reply(`Поздравление для ${ctx.message.text}`)
    ctx.scene.resume()
})

eventScene.label(EVENT_LABELS.START_PROMPT_TEXT).step(async (ctx) => {
    await ctx.reply('Опишите, за что вы цените своего коллегу, начиная с "Я ценю тебя за"')
})

eventScene.wait(EVENT_LABELS.WAIT_PROMPT_TEXT).on('message:text', async (ctx) => {
    if (!ctx.message.text.toLowerCase().startsWith('я ценю тебя за')) {
        await ctx.reply('Пожалуйста, начните с "Я ценю тебя за"')
        return;
    }
    ctx.session.event.prompt = ctx.message.text
    await ctx.reply(`Отлично, ваш запрос: ${ctx.message.text}`)
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
    await ctx.reply('Запрос на генерацию отправлен, ожидайте ответа! В среднем, генерация занимает 1-2 минуты, но из-за очереди запросов могут быть задержки.', {
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
        'По-джедайски': `Представь, что ты Магистр Йода из "Звездных Войн" и перепиши текст для ${ctx.session.event.name} "${ctx.session.event.prompt}", используя стилистику ответов Магистра Йоды. ПРИМЕРЫ ОТВЕТОВ В СТИЛЕ МАГИСТРА ЙОДЫ:\n
Темная сторона манит. Но кто раз стал на темную тропу, по ней и будет идти всегда.\n
Поглотит она вас, как поглотила ученика Оби-Вана Кеноби.\n
Решение принимаешь ты один. Но помнить должен, что делаешь это также и за других, кто стоит за плечом твоим.\n
Гнев, страх, агрессия – это темные стороны силы. Легко приходят они, быстро присоединяются к схватке. Стерегись их.Тяжела цена за мощь, которую они дают.\n
ВАЖНО: Твой ответ должен состоять из 3 предложений, содержать имя адресата, быть задумчивым и философским, выражать дружескую симпатию`,

        'По-старославѣнски': `Представь, что ты говоришь на древнерусском. Перепиши текст, адресованный ${ctx.session.event.name}, "${ctx.session.event.prompt}" используя стилистику ответов в старорусском стиле. ПРИМЕРЫ ОТВЕТОВ В СТИЛЕ ДРЕВНЕРУССКОЙ РЕЧИ: \nЗемнаго не сведая и небесных пытаеши \nЕдин есть раб во всяком дому — сам господин \n Вещати умеют мнози, а разумети не вси \n Друг любезный \n Люба мой \n Разласка милая \n ВАЖНО: Твой ответ должен состоять из 2 предложений, содержать обращение к адресату «Люба мой» и «разласка милая», выражать любовь, дружескую симпатию, содержать имя адресата и быть человеколюбивым и добрым`,

        'По-пацански': `Представь, что ты уличный хулиган. Перепиши текст, адресованный ${ctx.session.event.name}, "${ctx.session.event.prompt}" используя стилистику ответов на уличном жаргоне. ПРИМЕРЫ ОТВЕТОВ В СТИЛЕ УЛИЧНОГО ХУЛИГАНА: \nстарший \nстрём \nвнатуре \nблагодарочка \nслышь \nпонял \nфраер \nвпадлу \nпалюбому \nВАЖНО: Твой ответ должен быть без использования нецензурной лексики, состоять из 3 предложений, быть дружелюбным, и выражать дружескую симпатию`
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
        const board = setupKeyboard([...GEN_ANSWERS, ...CANCEL])
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
                    resize_keyboard: true
                }
            })
        } else {
            const errorBoard = setupKeyboard(CANCEL)
            await ctx.reply('Что-то пошло не так, пожалуйста попробуйте снова!', {
                reply_markup: {
                    one_time_keyboard: true,
                    resize_keyboard: true,
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
    const board = setupKeyboard(['Телефон', 'Логин'])
    await ctx.reply('Теперь мне нужно предоставить номер телефона коллеги или его логин в Telegram. Что вы предоставите?', {
        reply_markup: {
            ...board,
            one_time_keyboard: true,
            resize_keyboard: true
        }
    })
})

eventScene.wait(EVENT_LABELS.WAIT_LOGIN).setup((scene) => {
    scene.hears('Телефон', async (ctx) => {
        await ctx.reply('Введите телефон начиная с +7 дальше без символов, только цифры!')
        ctx.scene.goto(EVENT_LABELS.PRE_PHONE)
    })
    scene.hears('Логин', async (ctx) => {
        await ctx.reply('Введите логин в Telegram без "@"')
        ctx.scene.goto(EVENT_LABELS.PRE_LOGIN)
    })
    scene.on('message:text', async (ctx) => {
        await ctx.reply('Пожалуйста, выберите один из вариантов!')
    })
})

eventScene.label(EVENT_LABELS.WITH_ANONYMITY).step(async (ctx) => {
    const board = setupKeyboard([...ANO_ANSWER, ...CANCEL])
    await ctx.reply('Хотели бы вы указать от кого будет открытка?', {
        reply_markup: {
            ...board,
            one_time_keyboard: true,
            resize_keyboard: true,
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
                resize_keyboard: true
            }
        })
    }
})

eventScene.label(EVENT_LABELS.SEND_REQUEST).step(async (ctx) => {
    try {
        const user = eventDataBase.get(ctx.session.event.login as string) ?? []
        const newUserData = {
            file_id: ctx.session.event.file_id,
            text: ctx.session.event.prompt,
            isMessageSend: false,
            from: ctx.session.event.author,
            isShowAuthor: ctx.session.event.isShowWhoSend
        }

        let newData = [...user, newUserData];
        eventDataBase.set(ctx.session.event.login as string, newData)
        await ctx.reply('Все готово! Далее вам нужно пригласить коллегу в чат со мной, и предложить ему ввести команду /get_cards, что бы получить свою открытку!', {
            reply_markup: {
                remove_keyboard: true
            }
        })
    } catch (err) {
        await ctx.reply('Что-то пошло не так, пожалуйста попробуйте заново!', {
            reply_markup: {
                remove_keyboard: true
            }
        })
    }

})

eventScene.label(EVENT_LABELS.END).step(async (ctx) => {
    await ctx.reply('Генерация окончена! Если хотите отправить новую открытку, просто введите /event')
    ctx.scene.exit()
})

eventScene.label(EVENT_LABELS.PRE_PHONE)
eventScene.wait(EVENT_LABELS.PHONE).on('message:text',async (ctx) => {
    console.log(ctx.message.text)
    if (!ctx.message.text.startsWith('+7') || ctx.message.text.match(/[()\-\s]/gi)) {
        await ctx.reply('Пожалуйста, введите телефон начиная с +7 дальше без символов, только цифры!')
        return;
    }
    ctx.session.event.login = ctx.message?.text
    ctx.scene.goto(EVENT_LABELS.WITH_ANONYMITY)
})

eventScene.label(EVENT_LABELS.PRE_LOGIN)
eventScene.wait(EVENT_LABELS.LOGIN).on('message:text',async (ctx) => {
    if (ctx.message?.text?.startsWith('@')) {
        await ctx.reply('Пожалуйста, введите логин без "@"')
        return;
    }
    ctx.session.event.login = ctx.message?.text
    ctx.scene.goto(EVENT_LABELS.WITH_ANONYMITY)
})
