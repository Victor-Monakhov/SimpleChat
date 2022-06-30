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
        this.listenEntryData();
        this.newRoomListener();
        this.listenRoomsSearchingResult();
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

    public onTheme(theme: string): void {
        this.theme = theme;
    }

    private listenEntryData(): void {
        this.subs.add(
            this.apiService.getEntryData().subscribe((data) => {
                data.rooms.forEach((room) => {
                    this.userService.unreadInRooms.set(room._id, 0);
                    room.lastAction = new Date(room.lastAction);
                    this.userService.rooms.push(room);
                });
                this.userService.currentRoom = this.userService.rooms.find((room) => {
                    return room._id === LocalStorageService.getlastRoomId()
                }) || this.userService.rooms[0];
            })
        );
    }

    private newRoomListener(): void {
        this.subs.add(
            this.apiService.getNewRoom().subscribe(data => {
                data.lastAction = new Date(data.lastAction);
                this.userService.rooms.unshift(data);
                this.userService.unreadInRooms.set(data._id, 0);
            })
        );
    }

    private listenRoomsSearchingResult(): void {
        this.subs.add(
            this.apiService.getRoomsSearchingResult().subscribe((rooms) => {
                this.userService.searchedRooms = rooms;
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
