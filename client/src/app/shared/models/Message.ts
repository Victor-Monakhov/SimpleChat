import {IUser} from "./IUser";

export interface Message {
    createdAt?: Date;
    content?: string;
    creator?: IUser;
    room?: string;
    _id?: string;
    isSystemMessage?: boolean;
    read?: string[];
}
