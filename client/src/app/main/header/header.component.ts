import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../../shared/services/auth.service';
import {Router} from '@angular/router';
import {SocketService} from '../../shared/services/socket.service';
import {ChatService} from '../../shared/services/chat.service';
import {IUser} from '../../shared/models/IUser';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    public signButton: boolean = true;
    public user?: IUser;

    public constructor(private authService: AuthService,
                       private router: Router,
                       private socketService: SocketService,
                       private chatService: ChatService) {
    }

    public ngOnInit(): void {
        this.user = this.chatService.user;
        if (!this.user) {
            this.logOut();
        }
    }

    public logOut(): void {
        this.authService.logOut();
    }
}
