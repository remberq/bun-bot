import { Bot , Context, session, SessionFlavor } from "grammy";
import { ScenesSessionData, ScenesFlavor } from "grammy-scenes"
import {scenes} from "./scenes/scene.ts";

type SessionData = ScenesSessionData & {
    prompt: string;
    style: string;
    count: number;
}

export type BotContext = Context & SessionFlavor<SessionData> & ScenesFlavor

const bot = new Bot<BotContext>(process.env.TOKEN)

function initial(): SessionData {
    return { style: 'DEFAULT', prompt: '' , count: 1};
}

bot.use(session({initial}))

// Inject ctx.scenes
bot.use(scenes.manager())

bot.command("start", async (ctx) => {
    await ctx.reply(`Welcome here.`)
    await ctx.scenes.enter("main")
})

// Actually run scenes
bot.use(scenes)
export default bot;
