import {Component, HostBinding, OnInit, ViewChild} from '@angular/core';
import {ApiService} from '../shared/services/api.service';
import {ContextMenuComponent} from '@syncfusion/ej2-angular-navigations';
import {LocalStorageService} from '../shared/services/local-storage.service';
import {Subject} from 'rxjs';
import {THEMES} from '../shared/enums/theme.enum';
import {SubSink} from 'subsink';
import {IRoom} from '../shared/models/IRoom';
import {PanelService} from '../shared/services/panel.service';
import {UserService} from '../shared/services/user.service';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
    @ViewChild('contextmenu') public contextmenu: ContextMenuComponent;
    @HostBinding('class') public theme: string = THEMES.DARK;
    private subs: SubSink = new SubSink();

    public constructor(private apiService: ApiService,
                       private userService: UserService,
                       private panelService: PanelService) {
    }

    public ngOnInit(): void {
        this.themeListener();
        this.usersSearchingListener();
        const aSub = this.apiService.getBlacklist().subscribe((blacklist) => {
            LocalStorageService.setBlacklist(blacklist);
            aSub.unsubscribe();
        });
    }

    public contactMenuTriggerHandler(trigger: boolean): void {
        this.panelService.isContactMenu$.next(trigger);
    }

    public addingRoomTriggerHandler(trigger: boolean): void {
        this.panelService.isAddingRoom$.next(trigger);
    }

    private themeListener(): void {
        this.subs.add(
            this.apiService.getTheme().subscribe((theme) => this.theme = theme)
        );
    }

    private usersSearchingListener(): void {
        this.subs.add(
            this.apiService.getUsersSearchingResult().subscribe((users) => {
                this.userService.searchedUsers$.next(users);
            })
        );
    }

    public get contactMenuTrigger$(): Subject<boolean> {
        return this.panelService.isContactMenu$;
    }

    public get isFlipped$(): Subject<boolean> {
        return this.panelService.isContactMenuFlipped$;
    }

    public get addingRoomTrigger$(): Subject<boolean> {
        return this.panelService.isAddingRoom$;
    }
}
