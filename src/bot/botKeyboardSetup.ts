import {InlineKeyboard} from "grammy";
import {TStylesResponse} from "../services/KandinskyServices.ts";

export const setupInlineKeyboard = (buttons: TStylesResponse[], offset: number ) => {
    const inlineKeyboard = new InlineKeyboard()
    buttons.forEach((button, index) => {
        inlineKeyboard.text(button.title, JSON.stringify(button.name))
        if (offset - 1 === index) {
            inlineKeyboard.row()
        }
    })
    
    return inlineKeyboard
}