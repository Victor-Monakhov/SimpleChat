import {Injectable} from '@angular/core';
import {LocalStorageService} from './local-storage.service';
import {NAVIGATE} from '../../app.config';
import {SocketService} from './socket.service';
import {Router} from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    public constructor(private socketService: SocketService,
                       private router: Router) {
    }

    public isAuthenticated(): boolean {
        const token = LocalStorageService.getToken();
        return !!token;
    }

    public logOut(): void {
        LocalStorageService.logout();
        this.socketService.disconnect();
        this.router.navigate([`/${NAVIGATE.WELCOME}`]).then();
    }
}
