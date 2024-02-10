import { Bot , Context, session, SessionFlavor } from "grammy";
import { ScenesSessionData, ScenesFlavor } from "grammy-scenes"
import {scenes} from "./scenes/scene.ts";
import {SCENE} from "./types/models.ts";
import {IGigaChatMessages} from "./types/gigaModels.ts";

interface IEventSession {
    theme?: string;
    name?: string;
    login?: string;
    picture?: Buffer | 'ERROR';
    prompt?: string;
    file_id?: string;
    isShowWhoSend?: boolean;
    author?: string;
}

type SessionData = ScenesSessionData & {
    temp?: number;
    prompt: string;
    isOver: boolean;
    style: {
        title?: string;
        name: string;
    };
    allStyle?: {
        title?: string;
        name: string;
    }[];
    gigaPrompt: Partial<IGigaChatMessages>;
    gigaRole: string;
    gigaMessages: IGigaChatMessages[];
    activeScene: SCENE | null;
    controller?: AbortController;
    event: IEventSession;
}

export type BotContext = Context & SessionFlavor<SessionData> & ScenesFlavor

const bot = new Bot<BotContext>(process.env.TOKEN)

export function initial(): SessionData {
    return {
        isOver: false,
        style: {
            name: 'DEFAULT',
            title: 'Свой стиль'
        },
        prompt: '' ,
        gigaPrompt: {},
        gigaRole: '',
        gigaMessages: [],
        activeScene: null,
        event: {}
    };
}

bot.use(session({initial}))

bot.use(scenes.manager())

bot.use(scenes)
export default bot;
