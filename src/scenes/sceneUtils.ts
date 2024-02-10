import {SceneFlavoredContext} from "grammy-scenes";
import {BotContext} from "../bot.ts";
import {SLASH_COMMAND} from "../types/models.ts";

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