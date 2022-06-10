import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../shared/services/auth.service';
import {Router} from '@angular/router';
import {SocketService} from '../../shared/services/socket.service';
import {ApiService} from '../../shared/services/api.service';
import {IUser} from '../../shared/models/IUser';
import {UserService} from '../../shared/services/user.service';

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
                       private userService: UserService) {
    }

    public ngOnInit(): void {
        this.user = this.userService.user;
        if (!this.user) {
            this.logOut();
        }
    }

    public logOut(): void {
        this.authService.logOut();
    }
}
