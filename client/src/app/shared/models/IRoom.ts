import {IUser} from './IUser';

export interface IRoom {
    _id?: string;
    title?: string;
    users?: IUser[];
    creator?: IUser;
    index?: number;
    lastAction?: Date;
    isPublic?: boolean;
    isFavorites?: boolean;
}
