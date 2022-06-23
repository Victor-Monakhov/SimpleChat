import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {IUser} from '../../shared/models/IUser';

@Component({
    selector: 'app-users-search-tip',
    templateUrl: './users-search-tip.component.html',
    styleUrls: ['./users-search-tip.component.scss']
})
export class UsersSearchTipComponent implements OnInit {

    @Input() public tipContent: IUser[] = [];
    @Output() public userEvent: EventEmitter<IUser> = new EventEmitter<IUser>();

    public constructor() {
    }

    public ngOnInit(): void {
        return;
    }

    public onChoice(user: IUser): void {
        this.userEvent.emit(user);
    }
}
