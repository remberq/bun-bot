import {InlineKeyboard, Keyboard} from "grammy";
import {TStylesResponse} from "../types/kandinskyModels.ts";

/**
 * Определяем четное ли число
 * @param num число которое нужно проверить
 */
const isEven = (num: number) => {
    return num % 2 === 0
}

/**
 * Возвращаем инлайн клавиатуру
 * @param buttons массив строк, из которых формируем кнопки для бота
 * @param offset значение через которое нужно сделать новый ряд
 */
export const setupInlineKeyboard = (buttons: TStylesResponse[], offset: number ) => {
    const inlineKeyboard = new InlineKeyboard()
    buttons.forEach((button, index) => {
        inlineKeyboard.text(button.title, JSON.stringify({name: button.name, title: button.title}))
        if (offset - 1 === index) {
            inlineKeyboard.row()
        }
    })
    
    return inlineKeyboard
}

/**
 * Возвращаем клавиатуру по 2 значения в ряду
 * @param buttons массив строк, из которых формируем кнопки для бота
 */
export const setupKeyboard = (buttons: string[] ) => {
    const keyboard = new Keyboard()
    buttons.forEach((button, index) => {
        keyboard.text(button)
        if (!isEven(index)) {
            keyboard.row()
        }
    })

    return keyboard.resized()
}