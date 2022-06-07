import {Injectable} from '@angular/core';
import * as io from 'socket.io-client';
import {Observable} from 'rxjs';
import {LocalStorageService} from './local-storage.service';
import {config} from '../config';

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    public socket: any;
    public readonly uri: string = config.API_URL;
    public isConnected: boolean = false;

    public connect(): void {
        if (!this.isConnected) {
            this.socket = io(this.uri, {query: `token=${LocalStorageService.getToken()}`});
            this.isConnected = true;
        } else {
            console.log('---UNAUTHORIZED. SOCKET IS NOT CONNECTED');
        }
    }

    public listen(eventName: string): Observable<any> {
        return new Observable((subscriber) => {
            this.socket.on(eventName, (data) => {
                subscriber.next(data);
            });
        });
    }

    public emit(eventName: string, data: any): void {
        this.socket.emit(eventName, data);
    }

    public disconnect(): void {
        this.socket.disconnect();
        this.isConnected = false;
    }
}
