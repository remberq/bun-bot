export enum COMMAND {
    START = 'start',
    KANDINSKY = 'kandinsky',
    GIGA_CHAT = 'giga_chat',
    HELP = 'help',
    END_SCENE = 'end'
}

export enum SLASH_COMMAND {
    START = '/start',
    KANDINSKY = '/kandinsky',
    GIGA_CHAT = '/giga_chat',
    HELP = '/help',
    END_SCENE = '/end'
}

export enum GIGA_LABELS {
    START = "START",
    CHANGE_ROLE = 'CHANGE_ROLE',
    QUESTION_PROMPT = 'QUESTION_PROMPT',
    WAIT_PROMPT = 'WAIT_PROMPT',
    PROMPT_ROLE = 'PROMPT_ROLE',
    PROMPT_TEXT = 'PROMPT_TEXT',
    CALL_KANDINSKY = 'CALL_KANDINSKY',
    END = 'EDN',
}

export enum KANDINSKY_LABELS {
    START = "START",
    WAIT_REQUEST = 'WAIT_REQUEST',
    WAIT_PROMPT = 'WAIT_PROMPT',
    PROMPT_TEXT = 'PROMPT_TEXT',
    PROMPT_STYLE = 'PROMPT_STYLE',
    CALL_GIGA = 'CALL_GIGA',
    END = 'END'
}

export enum SCENE {
    GIGA_CHAT = 'GIGA_CHAT',
    KANDINSKY = 'KANDINSKY'
}
