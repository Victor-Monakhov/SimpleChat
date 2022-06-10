import {Component, EventEmitter, HostBinding, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {IRoom} from '../../shared/models/IRoom';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {SocketService} from '../../shared/services/socket.service';
import {ApiService} from '../../shared/services/api.service';
import {THEMES} from '../../shared/enums/theme.enum';
import {SubSink} from 'subsink';
import {API_INPUT_EVENT, API_OUTPUT_EVENT} from '../../shared/enums/api-event.enum';
import {LocalStorageService} from '../../shared/services/local-storage.service';
import {UserService} from '../../shared/services/user.service';
import {DialogAddingRoomComponent} from '../../dialog-adding-room/dialog-adding-room.component';
import {PanelService} from '../../shared/services/panel.service';

@Component({
    selector: 'app-chat-settings-panel',
    templateUrl: './chat-settings-panel.component.html',
    styleUrls: ['./chat-settings-panel.component.scss']
})
export class ChatSettingsPanelComponent implements OnInit, OnDestroy {
    @Output() onCreateRoom: EventEmitter<any> = new EventEmitter<any>();
    @Output() closeList: EventEmitter<any> = new EventEmitter<any>();
    private subs: SubSink = new SubSink();
    public rooms: IRoom[] = [];
    public unread: object = {};
    public isCheckedTheme: boolean = true;
    public searchedRooms: IRoom[] = [];
    public searchMessage: string = '';


    public isSearchRoomList: boolean = false;
    public config: PerfectScrollbarConfigInterface = {wheelSpeed: 0.2, scrollingThreshold: 0};

    public constructor(private socketService: SocketService,
                       private apiService: ApiService,
                       private userService: UserService,
                       private panelService: PanelService) {
    }

    public ngOnInit(): void {
        this.listenTheme();
        this.listenRoomsSearchingResult();
        this.listenEntryData();
    }

    public ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    // public createRoom(): void {
    //     this.onCreateRoom.emit();
    // }

    public onRoom(selectedRoom: IRoom): void {
        this.userService.currentRoom = this.rooms.find((room) => selectedRoom._id === room._id);
    }

    public createRoom(): void {
        this.panelService.isAddingRoom$.next(true);
        // const dialogRef = this.dialog.open(DialogAddingRoomComponent, {
        //     width: '500px',
        //     height: '650px',
        //     hasBackdrop: true
        // });
        // const aSub = dialogRef.afterClosed().subscribe(result => {
        //     if (result) {
        //         this.socketService.emit('createRoom', result);
        //     }
        //     aSub.unsubscribe();
        // });
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
        this.isSearchRoomList = !this.isSearchRoomList;
        this.searchRooms();
    }

    public searchRooms(): void {
        this.apiService.setRoomsSearching(this.searchMessage);
    }

    private listenTheme(): void {
        this.subs.add(
            this.apiService.getTheme().subscribe((theme) => {
                this.isCheckedTheme = theme === THEMES.DARK;
            })
        );
    }

    private listenRoomsSearchingResult(): void {
        this.subs.add(
            this.apiService.getRoomsSearchingResult().subscribe((rooms) => {
                this.searchedRooms = rooms;
            })
        );
    }

    private listenEntryData(): void {
        this.subs.add(
            this.apiService.getEntryData().subscribe((data) => {
                data.rooms.forEach((room) => {
                    this.unread[room._id] = 0;
                    room.lastAction = new Date(room.lastAction);
                    this.userService.rooms.push(room);
                });
                this.rooms = this.userService.rooms;
                // this.listOfRooms = this.rooms;
                this.userService.currentRoom = this.rooms.find(
                    (room) => room._id === LocalStorageService.getlastRoomId()) || this.rooms[0];
            })
        );
    }
}
