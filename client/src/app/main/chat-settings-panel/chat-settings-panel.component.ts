import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {IRoom} from '../../shared/models/IRoom';
import {SocketService} from '../../shared/services/socket.service';
import {ApiService} from '../../shared/services/api.service';
import {THEMES} from '../../shared/enums/theme.enum';
import {SubSink} from 'subsink';
import {UserService} from '../../shared/services/user.service';
import {PanelService} from '../../shared/services/panel.service';
import {Subject} from 'rxjs';

@Component({
    selector: 'app-chat-settings-panel',
    templateUrl: './chat-settings-panel.component.html',
    styleUrls: ['./chat-settings-panel.component.scss']
})
export class ChatSettingsPanelComponent implements OnInit, OnDestroy {
    @Output() public themeEvent: EventEmitter<string> = new EventEmitter<string>();
    private subs: SubSink = new SubSink();
    public isCheckedTheme: boolean = true;
    public textForSearching: string = '';


    public isGlobally: boolean = false;

    public constructor(private socketService: SocketService,
                       private apiService: ApiService,
                       private userService: UserService,
                       private panelService: PanelService) {
    }

    public ngOnInit(): void {
        this.listenTheme();
    }

    public ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    public onRoom(selectedRoom: IRoom): void {
        this.userService.currentRoom = this.rooms.find((room) => selectedRoom._id === room._id);
    }

    public createRoom(): void {
        this.panelService.isAddingRoom$.next(true);
    }

    // public goToRoom(searchedRoom: IRoom): void {
    //     if (!this.isSearchRoomList) {
    //         this.onSelectedRoom.emit(searchedRoom._id);
    //         if (this.apiService.device['isMobile']) {
    //             this.closeList.emit();
    //         }
    //     }
    //     // else {
    //     //     searchedRoom = searchedRoom as Room;
    //     //     for (let room of this.rooms) {
    //     //         if (room._id === searchedRoom._id) {
    //     //             this.onSelectedRoom.emit(searchedRoom.index);
    //     //             return;
    //     //         }
    //     //     }
    //     //     this.socketService.emit('joinRoom', {roomId: searchedRoom._id});
    //     //     this.onSelectedRoom.emit(searchedRoom._id);
    //     // }
    // }

    public toggleTheme(): void {
        (this.isCheckedTheme) ?
            this.apiService.setTheme(THEMES.LIGHT) :
            this.apiService.setTheme(THEMES.DARK);
    }

    public toggleSearch(): void {
        this.isGlobally = !this.isGlobally;
        this.searchRooms();
    }

    public searchRooms(): void {
        this.apiService.setRoomsSearching(this.textForSearching);
    }

    public closeSettings(): void {
        this.isChatSettingsVisible$.next(false);
    }

    private listenTheme(): void {
        this.subs.add(
            this.apiService.getTheme().subscribe((theme) => {
                this.isCheckedTheme = theme === THEMES.DARK;
                this.themeEvent.emit(theme);
            })
        );
    }

    public get currentRoom(): IRoom {
        return this.userService.currentRoom;
    }

    public get rooms(): IRoom[] {
        return this.userService.rooms;
    }

    public get unread(): Map<string, number> {
        return this.userService.unreadInRooms;
    }

    public get searchedRooms(): IRoom[] {
        if (this.isGlobally) {
            return this.userService.searchedRooms;
        } else {
            return this.userService.rooms;
        }
    }

    public get isChatSettingsVisible$(): Subject<boolean> {
        return this.panelService.isChatSettingsVisible$;
    }
}
