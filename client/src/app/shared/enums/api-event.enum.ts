export enum SOCKET_API_INPUT_EVENT {
    SEARCH_ROOMS = 'searchRoomsResult',
    SEARCH_USERS = 'searchResult',
    CHANGE_THEME = 'colorChanged',
    NEW_ROOM = 'newRoom',
    ENTRY = 'join'
}

export enum SOCKET_API_OUTPUT_EVENT {
    SEARCH_ROOMS = 'searchRooms',
    SEARCH_USERS = 'searchUsers',
    CHANGE_THEME = 'changeColor',
    CREATE_ROOM = 'createRoom'
}

export enum HTTP_API_EVENT {
    SEARCH_USERS= 'searchUsers'
}
