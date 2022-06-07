import {IRoom} from './IRoom';
import {IUser} from './IUser';

export interface IEntryData{
    message: string,
    rooms: IRoom[],
    usersOnline: IUser[];
}
