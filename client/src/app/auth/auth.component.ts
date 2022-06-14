import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {LocalStorageService} from '../shared/services/local-storage.service';
import {AuthService} from '../shared/services/auth.service';
import {IUser} from '../shared/models/IUser';
import {NAVIGATE} from '../app.config';

@Component({
    selector: 'app-auth',
    template: ''
})
export class AuthComponent implements OnInit {

    public constructor(private router: Router,
                       private route: ActivatedRoute,
                       private authService: AuthService) {
    }

    public ngOnInit(): void {
        LocalStorageService.setUser(JSON.stringify(this.route.snapshot.queryParams as IUser));
        if (this.authService.isAuthenticated()) {
            this.router.navigate([`/${NAVIGATE.CHAT}`]).then();
        } else {
            this.authService.logOut();
        }
    }
}
