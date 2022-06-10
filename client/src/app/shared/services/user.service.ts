import {Injectable} from '@angular/core';
import {IUser} from '../models/IUser';
import {IRoom} from '../models/IRoom';
import {LocalStorageService} from './local-storage.service';
import {AuthService} from './auth.service';
import {SocketService} from './socket.service';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    public user: IUser = {} as IUser;
    public currentRoom: IRoom = {} as IRoom;
    public rooms: IRoom[] = [];

    public constructor(private authService: AuthService,
                       private socketService: SocketService) {
        this.init();
    }

    private init(): void {
        const user = LocalStorageService.getUser() as IUser;
        if (user && this.authService.isAuthenticated()) {
            this.user = user;
            this.socketService.connect();
        } else {
            this.authService.logOut();
        }
    }
}
