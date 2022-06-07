export interface IUser {
    _id?: string;
    name?: string;
    isOnline?: boolean;
    isPremium?: boolean;
    socketId?: string;
    avatar?: string;
    blackList?: IUser[];
    socketIds?: string[];
}

