import {Component, EventEmitter, HostBinding, Input, OnInit, Output} from '@angular/core';
import {IRoom} from '../../shared/models/IRoom';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {SocketService} from '../../shared/services/socket.service';
import {ChatService} from '../../shared/services/chat.service';
import {THEMES} from '../../shared/enums/theme.enum';
import {SubSink} from 'subsink';

@Component({
    selector: 'app-room-list',
    templateUrl: './room-list.component.html',
    styleUrls: ['./room-list.component.scss']
})
export class RoomListComponent implements OnInit {
    @Input() rooms: IRoom[];
    @Input() unread: object;
    @Output() onSelectedRoom: EventEmitter<any> = new EventEmitter<any>();
    @Output() onCreateRoom: EventEmitter<any> = new EventEmitter<any>();
    @Output() closeList: EventEmitter<any> = new EventEmitter<any>();
    private subs: SubSink = new SubSink();
    public isCheckedTheme: boolean = true;
    public searchedRooms: IRoom[];
    public searchText: string = '';
    public isSearchRoomList: boolean = false;
    public config: PerfectScrollbarConfigInterface = {wheelSpeed: 0.2, scrollingThreshold: 0};

    public constructor(private socketService: SocketService,
                private chatService: ChatService) {
    }

    public ngOnInit(): void {
        this.subs.add(
            this.chatService.getTheme().subscribe((theme) => {
                this.isCheckedTheme = theme === THEMES.DARK;
            })
        );

        this.socketService.listen('searchRoomsResult').subscribe(rooms => this.searchedRooms = rooms);
    }

    public createRoom(): void {
        this.onCreateRoom.emit();
    }

    public goToRoom(searchedRoom: IRoom): void {
        if (!this.isSearchRoomList) {
            this.onSelectedRoom.emit(searchedRoom._id);
            if (this.chatService.device['isMobile']) {
                this.closeList.emit();
            }
        }
        // else {
        //     searchedRoom = searchedRoom as Room;
        //     for (let room of this.rooms) {
        //         if (room._id === searchedRoom._id) {
        //             this.onSelectedRoom.emit(searchedRoom.index);
        //             return;
        //         }
        //     }
        //     this.socketService.emit('joinRoom', {roomId: searchedRoom._id});
        //     this.onSelectedRoom.emit(searchedRoom._id);
        // }
    }

    public toggleTheme(): void {
        if (this.isCheckedTheme) {
            this.socketService.emit('changeColor', {theme: THEMES.LIGHT});
        } else {
            this.socketService.emit('changeColor', {theme: THEMES.DARK});
        }
    }

    public searchRooms(): void {
        this.socketService.emit('searchRooms', this.searchText);
    }

    public toggleSearch(): void {
        this.isSearchRoomList = !this.isSearchRoomList;
        this.searchRooms();
    }

}
