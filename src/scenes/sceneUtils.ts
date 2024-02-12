import {SceneFlavoredContext} from "grammy-scenes";
import {BotContext} from "../bot.ts";
import {SLASH_COMMAND} from "../types/models.ts";
import {userDataBase} from "../bootstrap.ts";

/**
 * Возвращает флаг, того что введена неизвестная команда
 * @param ctx контекст сообщения
 */
export const isUnknownCommandType = (ctx: SceneFlavoredContext<BotContext, undefined>) => {
    const mess = ctx.message?.text?.split('@')[0]
    return ctx.message?.text && ctx.message.text.startsWith('/') && !Object.values(SLASH_COMMAND).includes(mess as SLASH_COMMAND);
}

/**
 * Отвечает пользователю если набранная команда не существует
 * @param ctx контекст сообщения
 */
export const unknownCommandText = async (ctx: SceneFlavoredContext<BotContext, undefined>) => {
    if (isUnknownCommandType(ctx)) {
        await ctx.reply(`Мне не знакомы эти команды. \nМне известны только такие
        
          -- ${SLASH_COMMAND.GIGA_CHAT}    --  Начать чат с GigaChat
          
          -- ${SLASH_COMMAND.KANDINSKY}   --  Начать чат с Kandinsky
          
          -- ${SLASH_COMMAND.END_SCENE}              --  Окончание чата во время общения с ботом
          
          -- ${SLASH_COMMAND.EVENT}           --  Поздравьте свою половинку`)
    }
}

/**
 * Проверяем что автор любого сообщения уже есть в базе данных и если нет - то прокидываем в функцию записи в базу данных
 * @param ctx контекст сообщения
 */
export const isThisChatMemberHasNotInDB = async (ctx: BotContext): Promise<boolean> => {
    const member = await ctx.getAuthor()

    return !!member.user.id! && !userDataBase.has(`${member.user.id!}`)
}

/**
 * Записываем в базу данных автора сообщения, если его еще там нет
 * @param ctx контекст сообщения
 */
export const handleWriteChatMemberInDB = async (ctx: BotContext) => {
    const member = await ctx.getAuthor()
    console.log(`Успешно записан в базу пользователь ${member.user.username} с chatID ${member.user.id}`)
    userDataBase.set(`${member.user.id!}`, {nick: member.user.username, isContactGet: false})

}