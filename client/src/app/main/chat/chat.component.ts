import {ChangeDetectorRef, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {IRoom} from '../../shared/models/IRoom';
import {ApiService} from '../../shared/services/api.service';
import {SocketService} from '../../shared/services/socket.service';
import {AuthService} from '../../shared/services/auth.service';
import {MatDialog} from '@angular/material/dialog';
import {DialogAddingRoomComponent} from '../../dialog-adding-room/dialog-adding-room.component';
import {DialogInvitationComponent} from '../../dialog-invitation/dialog-invitation.component';
import {LocalStorageService} from '../../shared/services/local-storage.service';
import {MatBadge} from '@angular/material/badge';
import {SmilesComponent} from '../smiles/smiles.component';
import {SubSink} from 'subsink';
import {IEntryData} from '../../shared/models/IEntryData.interface';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {


    @ViewChild('search', {static: false}) search: ElementRef;
    @ViewChild(MatBadge, {static: false}) badge: MatBadge;
    // -----------------------------------------------------------------------------------------------------------
    private subs: SubSink = new SubSink();
    public rooms: IRoom[] = [];
    public currentRoom: IRoom;
    public unreadInRooms: object = {};
    // -----------------------------------------------------------------------------------------------------------
    public opened: boolean = false;

    public newMessage: object = {};
    // public me: string;
    public listOfRooms: IRoom[] = [];
    public overallUnreadMessages: number = 0;

    public constructor(public chatService: ApiService,
                       private socketService: SocketService,
                       private authService: AuthService,
                       public dialog: MatDialog,
                       private cdr: ChangeDetectorRef) {
    }

    public ngOnInit(): void {
        // this.me = LocalStorageService.getUser()['id'];

        // -----------------------------------------------------------------------------------------------------------
        // -----------------------------------------------------------------------------------------------------------

        // this.socketService.listen('newMessage').subscribe(data => {
        //     this.newMessage = data;
        //     const tempRoom = this.rooms.find((room) => room._id === data.room);
        //     this.rooms = this.rooms.map((room) => {
        //         if (room._id === tempRoom._id) {
        //             room.lastAction = new Date();
        //         }
        //         return room;
        //     });
        //     if (data.room !== this.selectedRoom._id) {
        //         this.unreadInRooms[data.room] += 1;
        //         this.recountUnread();
        //     }
        //     this.listOfRooms = this.rooms;
        // });
        // this.socketService.listen('invitation').subscribe(data => this.openInvitation(data));

        // -----------------------------------------------------------------------------
        // ------------------------------------------------------------------------------

        // this.socketService.listen('userLeft').subscribe(data => {
        //     if (data.userId === this.me) this.leaveRoom(data.roomId);
        // });
        // this.socketService.listen('roomDeleted').subscribe(data => {
        //     this.rooms = this.rooms.filter(room => room._id !== data.id);
        //     this.listOfRooms = this.rooms;
        //     delete this.unreadInRooms[data.id];
        //     this.selectedRoom = this.rooms[0];
        // });
        // this.socketService.listen('roomRename').subscribe(data => {
        //     this.rooms = this.rooms.map(room => {
        //         if (room._id === data.id) room.title = data.title;
        //         return room;
        //     });
        //     this.listOfRooms = this.rooms;
        // });
        // this.socketService.listen('privacyChanged').subscribe(data => {
        //     this.rooms = this.rooms.map(room => {
        //         if (room._id === data.id) room.isPublic = data.isPublic;
        //         return room;
        //     });
        // })
    }

    public recountUnread(): void {
        this.overallUnreadMessages = 0;
        Object.values(this.unreadInRooms).forEach((item) => {
            this.overallUnreadMessages += item;
        });
    }

    public leaveRoom(roomId: string): void {
        this.rooms = this.rooms.filter(room => room._id !== roomId);
        this.rooms = this.rooms.map((room, index) => ({...room, index}));
        this.currentRoom = this.rooms[0];
    }

    public openSideNav(): void {
        this.opened = !this.opened;
    }

    // public createRoom(): void {
    //     const dialogRef = this.dialog.open(DialogAddingRoomComponent, {
    //         width: '500px',
    //         height: '650px',
    //         hasBackdrop: true
    //     });
    //     const aSub = dialogRef.afterClosed().subscribe(result => {
    //         if (result) {
    //             this.socketService.emit('createRoom', result);
    //         }
    //         aSub.unsubscribe();
    //     });
    // }

    private openInvitation(data: any): void {
        const invitationDialogRef = this.dialog.open(DialogInvitationComponent, {
            width: '450px',
            height: '200px',
            hasBackdrop: true,
            data
        });
        const aSub = invitationDialogRef.afterClosed().subscribe(response => {
            if (response) {
                if (response.isAgree) {
                    this.socketService.emit('acceptInvitation', {
                        roomId: response.roomId
                    });
                } else {
                    this.socketService.emit('leaveRoom', {
                        roomId: response.roomId
                    });
                }
            }
            aSub.unsubscribe();
        });
    }

    public changeUnreadByRoomId(e): void {
        this.unreadInRooms[e.roomId] = e.unread;
        this.recountUnread();
        this.cdr.detectChanges();
    }


}


