import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {config} from '../config';
import {Message} from '../models/Message';
import {SocketService} from './socket.service';
import {Option} from '../models/Option';
import {IUser} from '../models/IUser';
import {AuthService} from './auth.service';
import {IEntryData} from '../models/IEntryData.interface';
import {HTTP_API_EVENT, SOCKET_API_INPUT_EVENT, SOCKET_API_OUTPUT_EVENT} from '../enums/api-event.enum';
import {IRoom} from '../models/IRoom';
import {ICreateRoomData} from '../interfaces/create-room-data.interface';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    public theme: Subject<string> = new Subject<string>(); // temp

    public currentRoomUsers: BehaviorSubject<object[]> = new BehaviorSubject<object[]>([]);
    public device: object = {isDesktop: 1, isMobile: 0, isTablet: 0};
    public showContextMenu: BehaviorSubject<{ event: MouseEvent; options: Option[] }> = new BehaviorSubject<any>(null);
    public emitOption: BehaviorSubject<string> = new BehaviorSubject<string>('');

    public constructor(private http: HttpClient,
                       private socketService: SocketService,
                       private authService: AuthService) {
    }

    public getRoomContent(id: string, offset?: number, limit?: number): Observable<Message[]> {
        return this.http.get<Message[]>(`${config.API_URL}/roomContent/${id}?offset=${offset}&limit=${limit}`);
    }

    public getBlacklist(): Observable<string[]> {
        return this.http.get<string[]>(`${config.API_URL}/blacklist`);
    }

    public addToBlacklist(id: string): Observable<string[]> {
        return this.http.post<string[]>(`${config.API_URL}/blacklist`, {blacklistedId: id});
    }

    public deleteFromBlacklist(id: string): Observable<any> {
        return this.http.request('delete', `${config.API_URL}/blacklist`, {
            body: {
                blacklistedId: id
            }
        });
    }

    public searchUsersByNameSubStr(name: string): Observable<IUser[]> {
        return this.http.post<string[]>(
            `${config.API_URL}/${HTTP_API_EVENT.SEARCH_USERS}`, {name: name}
        ) as Observable<IUser[]>;
    }

    public getTheme(): Observable<string> {
        return this.socketService.listen(SOCKET_API_INPUT_EVENT.CHANGE_THEME);
    }

    public setTheme(theme: string): void {
        this.socketService.emit(SOCKET_API_OUTPUT_EVENT.CHANGE_THEME, {theme: theme});
    }

    public getEntryData(): Observable<IEntryData> {
        return this.socketService.listen(SOCKET_API_INPUT_EVENT.ENTRY);
    }

    public getRoomsSearchingResult(): Observable<IRoom[]> {
        return this.socketService.listen(SOCKET_API_INPUT_EVENT.SEARCH_ROOMS);
    }

    public setRoomsSearching(text: string): void {
        this.socketService.emit(SOCKET_API_OUTPUT_EVENT.SEARCH_ROOMS, text);
    }

    public getNewRoom(): Observable<IRoom> {
        return this.socketService.listen(SOCKET_API_INPUT_EVENT.NEW_ROOM);
    }

    // public getUsersSearchingResult(): Observable<IUser[]> {
    //     return this.socketService.listen(SOCKET_API_INPUT_EVENT.SEARCH_USERS);
    // }
    //
    // public setUsersSearching(name: string): void {
    //     this.socketService.emit(SOCKET_API_OUTPUT_EVENT.SEARCH_USERS, name);
    // }

    public createRoom(roomInfo: ICreateRoomData): void {
        this.socketService.emit(SOCKET_API_OUTPUT_EVENT.CREATE_ROOM, roomInfo);
    }
}
