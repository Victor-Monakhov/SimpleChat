import {Injectable} from '@angular/core';
import {IUser} from '../models/IUser';
import {IRoom} from '../models/IRoom';
import {LocalStorageService} from './local-storage.service';
import {AuthService} from './auth.service';
import {SocketService} from './socket.service';
import {ApiService} from './api.service';
import {Observable, Subject} from 'rxjs';
import {THEMES} from '../enums/theme.enum';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    public user: IUser = {} as IUser;
    public searchedUsers$: Subject<IUser[]> = new Subject<IUser[]>();
    public currentRoom: IRoom = {} as IRoom;
    public rooms: IRoom[] = [];
    public searchedRooms: IRoom[] = [];
    public unreadInRooms: Map<string, number> = new Map<string, number>;

    public constructor(private authService: AuthService,
                       private socketService: SocketService,
                       private apiService: ApiService) {
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
        this.searchedRooms = this.rooms;
    }
}
