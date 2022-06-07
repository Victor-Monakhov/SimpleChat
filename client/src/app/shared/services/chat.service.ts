import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {config} from '../config';
import {Message} from '../models/Message';
import {SocketService} from './socket.service';
import {DeviceDetectorService} from 'ngx-device-detector';
import {Option} from '../models/Option';
import {LocalStorageService} from './local-storage.service';
import {IUser} from '../models/IUser';
import {AuthService} from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    public isContactList: Subject<boolean> = new Subject<boolean>();
    public flipCard: Subject<boolean> = new Subject<boolean>();
    public theme: Subject<string> = new Subject<string>();
    public user?: IUser;

    public currentRoomUsers: BehaviorSubject<object[]> = new BehaviorSubject<object[]>([]);
    public device: object = {isDesktop: 1, isMobile: 0, isTablet: 0};
    public showContextMenu: BehaviorSubject<{ event: MouseEvent; options: Option[] }> = new BehaviorSubject<any>(null);
    public emitOption: BehaviorSubject<string> = new BehaviorSubject<string>('');

    public constructor(private http: HttpClient,
                       private socketService: SocketService,
                       private authService: AuthService,
                       private deviceDetector: DeviceDetectorService) {
        this.init();
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

    public getTheme(): Observable<string> {
        return this.socketService.listen('colorChanged');
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
