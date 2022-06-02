import {Component, OnInit} from '@angular/core';
import {CONFIG} from '../../../../app.config';

@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {

    public host: string = CONFIG.SERVER_HOST;

    constructor() {
    }

    ngOnInit() {
    }

}
