import {
    AfterViewInit,
    Component,
    ElementRef, EventEmitter,
    Input,
    OnChanges, OnDestroy,
    OnInit, Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {IRoom} from '../../shared/models/IRoom';
import {ApiService} from '../../shared/services/api.service';
import {Message} from '../../shared/models/Message';
import {
    PerfectScrollbarComponent,
    PerfectScrollbarConfigInterface,
} from 'ngx-perfect-scrollbar';
import {SocketService} from '../../shared/services/socket.service';
import {LocalStorageService} from '../../shared/services/local-storage.service';
import {IUser} from '../../shared/models/IUser';
import {MatDialog} from '@angular/material/dialog';
import {DialogInvitingRoomComponent} from '../../dialog-inviting-room/dialog-inviting-room.component';
import {EmojifyPipe} from 'angular-emojify';
import {DialogRoomSettingsComponent} from '../../dialog-room-settings/dialog-room-settings.component';
// import {log} from 'util';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {SmilesComponent} from '../smiles/smiles.component';
import {MobileSmileComponent} from '../mobile-smile/mobile-smile.component';
import {MenuEventArgs, MenuItemModel} from '@syncfusion/ej2-navigations';
import {Browser} from '@syncfusion/ej2-base';
import {ContextMenuComponent} from '@syncfusion/ej2-angular-navigations';
import {iterativeBS} from '../../shared/utils/binarySearch';
import {Subscription} from 'rxjs';
import {Option} from '../../shared/models/Option';
import {PanelService} from '../../shared/services/panel.service';

@Component({
    selector: 'app-room',
    templateUrl: './room.component.html',
    styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
    @Input() currentRoom: IRoom;
    @Input() newMessage: object | boolean;
    @Input() unreadInRooms: number;

    @Output() leaveFromChat: EventEmitter<any> = new EventEmitter<any>();
    @Output() unreadMessages: EventEmitter<any> = new EventEmitter<any>();
    @Output() openList: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild(PerfectScrollbarComponent, {static: false}) componentRef: PerfectScrollbarComponent;
    @ViewChild('smileImg', {static: false}) smileImg: ElementRef;
    @ViewChild('inputText', {static: false}) input: ElementRef;
    @ViewChild('messagecontextmenu', {static: false}) public contextmenu: ContextMenuComponent;

    private isFlipCard: boolean = false;
    private aSub: Subscription = new Subscription();
    private content: string = '';
    private emoji: EmojifyPipe = new EmojifyPipe();
    private isLoadedTemplate: boolean = false;
    private isInit: boolean = false;
    private currentScrollPosition: number = 1;
    private isEditing: boolean = false;
    private amountOfUnread: number = 0;
    private isSmiles: boolean = false;
    private lastSelectedMessageId: string = '';
    private loadMessage: Message = {
        room: '',
        creator: {
            _id: '0',
            name: 'me',
            isOnline: true,
            isPremium: true,
            socketId: '1',
            avatar: ''
        },
        createdAt: new Date(),
        content: 'Load previous messages',
        _id: '0',
        isSystemMessage: true,
        read: [],
    };
    public overallUnreadMessages: number = 0;
    public messages: Message[] = [];
    public creator: IUser;
    public me: string = '';
    public users: object[] = [];
    public config: PerfectScrollbarConfigInterface = {scrollingThreshold: 0};
    public theme: string = 'dark';
    public isActiveMenu: boolean = false;
    public menuItems: Option[] = [
        {
            id: 'edit',
            title: 'Edit Message',
            icon: 'edit'
        },
        {
            id: 'delete',
            title: 'Delete Message',
            icon: 'delete'
        },
    ];


    public constructor(public apiService: ApiService,
                       public panelService: PanelService,
                       public dialog: MatDialog,
                       private socketService: SocketService,
                       private bottomSheet: MatBottomSheet) {
    }

    public ngOnInit(): void {
        this.me = LocalStorageService.getUser()['id'];
        this.loadMessage.read.push(this.me);
        this.aSub.add(
            this.apiService.emitOption.subscribe(optionId => this.onSelectOption(optionId))
        );
        this.aSub.add(
            this.apiService.theme.subscribe(selectedTheme => this.theme = selectedTheme)
        );
        this.updateRoom();
        this.socketListeners();
        this.isInit = true;
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (this.isInit) {
            if (changes['newMessage']) {
                if (this.currentRoom._id === changes['newMessage'].currentValue.room) {
                    this.messages.push(changes['newMessage'].currentValue.message);
                    this.calculateUnread();
                    if (changes['newMessage'].currentValue.message.creator._id === this.me) {
                        this.scrollToBottom();
                    }
                }
            }
            if (changes['currentRoom']) {
                LocalStorageService.setlastRoomId(this.currentRoom._id);
                this.updateRoom();
            }
            if (changes['unreadInRooms']) {
                this.overallUnreadMessages = this.unreadInRooms;
            }
        }
    }

    public ngAfterViewInit(): void {
        this.isLoadedTemplate = true;
        this.updateList();
    }

    public ngOnDestroy(): void {
        this.aSub.unsubscribe();
    }

    public onContactList(): void {
        this.panelService.isContactMenu$.next(true);
    }

    public socketListeners(): void {
        this.aSub.add(
            this.socketService.listen('userJoined').subscribe(data => {
                if (this.currentRoom._id === data.roomId) {
                    const usr = data.user;
                    if (this.currentRoom._id !== 'common') {
                        this.users[usr._id] = {
                            name: usr.name,
                            online: usr.isOnline,
                            premium: usr.isPremium,
                            creator: this.currentRoom.creator._id === usr._id,
                            avatar: usr.avatar
                        };
                    } else {
                        this.users[usr._id] = {
                            name: usr.name,
                            online: usr.isOnline,
                            premium: usr.isPremium,
                            avatar: usr.avatar
                        };
                    }
                    this.updateList();
                }
            })
        );

        this.aSub.add(
            this.socketService.listen('messageRead').subscribe(data => {
                this.messages = this.messages.map(message => {
                    if (message._id === data.id) {
                        message.read.push(data.user);
                    }
                    return message;
                });
                this.calculateUnread();
            })
        );

        this.aSub.add(
            this.socketService.listen('messageUpdated').subscribe(data => {
                const index = iterativeBS(this.messages, data);
                if (index !== -1) {
                    this.messages[index].content = data.newContent;
                }
            })
        );

        this.aSub.add(
            this.socketService.listen('messageDeleted').subscribe(data => {
                const index = this.messages.findIndex((mes) => mes._id === data.id);
                delete this.messages[index];
            })
        );

        this.aSub.add(
            this.socketService.listen('userLeft').subscribe(data => {
                if (this.currentRoom._id === data.roomId) {
                    delete this.users[data.userId];
                    this.updateList();
                }
            })
        );

        this.aSub.add(
            this.socketService.listen('userConnected').subscribe(userId => this.changeUserStatusOnline(true, userId))
        );

        this.aSub.add(
            this.socketService.listen('userDisconnected').subscribe(userId => this.changeUserStatusOnline(false, userId))
        );

    }

    private setScroll(): void {
        this.currentScrollPosition = +LocalStorageService.getScrollPosition(this.currentRoom._id);
        this.scrollY(this.currentScrollPosition);
    }

    public sendMessage(event: any): void {
        if (this.isEditing) {
            if (this.input.nativeElement.innerText.trim().length > 0) {
                if (event.code === 'Enter') {
                    event.preventDefault();
                }
                const transformedMessage = this.emoji.transform(this.input.nativeElement.innerText);
                this.socketService.emit('updateMessage', {
                    messageId: this.lastSelectedMessageId,
                    newContent: transformedMessage.trim(),
                    roomId: this.currentRoom._id,
                });
                this.input.nativeElement.innerText = '';
                this.isEditing = false;
            }
        } else {
            if (this.input.nativeElement.innerText.trim().length > 0) {
                if (event.code === 'Enter') {
                    event.preventDefault();
                }
                const transformedMessage = this.emoji.transform(this.input.nativeElement.innerText);
                this.socketService.emit('createMessage', {
                    message: transformedMessage.trim(),
                    room: this.currentRoom._id,
                });
                this.input.nativeElement.innerText = '';
            }
        }
    }

    public calculateUnread(): void {
        this.amountOfUnread = 0;
        this.messages.forEach(message => {
            if (message.read.indexOf(this.me) === -1 && this.me !== message.creator._id) {
                this.amountOfUnread += 1;
            }
        });
        this.unreadMessages.emit({unread: this.amountOfUnread, roomId: this.currentRoom._id});
    }

    // -----------------------------------------------------------------------------------------------------------

    private updateRoom(): void {
        this.isEditing = false;
        this.users = [];
        this.messages = [];
        if (this.currentRoom._id !== 'common') {
            this.currentRoom.users.forEach(user => {
                this.users[user._id] = {
                    name: user.name,
                    online: user.isOnline,
                    premium: user.isPremium,
                    creator: this.currentRoom.creator._id === user._id,
                    userId: user._id,
                    avatar: user.avatar
                };
            });
        } else {
            this.currentRoom.users.forEach(user => {
                this.users[user._id] = {
                    name: user.name,
                    online: user.isOnline,
                    premium: user.isPremium,
                    userId: user._id,
                    avatar: user.avatar
                };
            });
        }
        this.updateList();

        this.aSub.add(
            this.panelService.isContactMenuFlipped$.subscribe(flag => this.isLoadedTemplate && flag ? this.animateSmile() : false)
        );

        if (this.currentRoom._id !== 'common') {
            this.messageRequest();
        }
    }

    private updateList(): void {
        this.apiService.currentRoomUsers.next(Object.values(this.users));
    }


    // -----------------------------------------------------------------------------------------------------------


    public onViewportChange(event: any): void {
        if (this.isLoadedTemplate) {
            if (this.currentRoom._id !== 'common') {
                if (event.inView) {
                    this.socketService.emit('readMessage', {messageId: event.id});
                    this.calculateUnread();
                }
            }
        }
    }

    public onScroll(event: any): void {
        LocalStorageService.setScrollPosition(this.currentRoom._id, event.target.scrollTop);
        this.currentScrollPosition = event.target.scrollTop;
    }

    public onMessageRightClick(message: Message): void {
        if (message.creator._id === this.me) {
            this.lastSelectedMessageId = message._id;
        }
    }

    public messageRequest(scroll?: boolean): void {
        const [mesOff, mesLim] = [this.messages.length, this.messages.length < 50 ? 50 : 20];
        this.aSub.add(
            this.apiService.getRoomContent(this.currentRoom._id, mesOff, mesLim).subscribe(
                messages => {
                    this.messages = this.messages.filter(message => message.room !== '');
                    this.messages = [...messages, ...this.messages];
                    this.messages.unshift(this.loadMessage);
                    this.calculateUnread();
                },
                error => console.log(error),
                () => this.setScroll()
            )
        );

        if (scroll) {
            this.scrollY(1600);
        }
    }

    private animateSmile(): void {
        if (!this.isSmiles) {
            this.smileImg.nativeElement.style.filter = 'invert(100%) drop-shadow(0px 5px 5px black)';
            this.isSmiles = true;
        } else {
            this.smileImg.nativeElement.style.filter = '';
            this.isSmiles = false;
        }
    }

    private scrollY(scrollTop: number): void {
        this.componentRef.directiveRef.scrollToY(scrollTop);
    }

    private scrollToBottom(): void {
        this.componentRef.directiveRef.scrollToBottom(0, 0.3);
    }

    public openSmiles(): void {
        this.isFlipCard = !this.isFlipCard;
        this.panelService.isContactMenuFlipped$.next(this.isFlipCard);
    }

    public inviteUsers(): void {
        const dialogRef = this.dialog.open(DialogInvitingRoomComponent, {
            width: '500px',
            height: '550px',
            hasBackdrop: true,
            data: this.currentRoom
        });
        const aSub = dialogRef.afterClosed().subscribe(data => {
            if (data) {
                this.socketService.emit('inviteUsers', {roomId: data.roomId, participants: data.participants});
            }
            aSub.unsubscribe();
        });
    }

    public openSmilesList(): void {
        const bSheet = this.bottomSheet.open(MobileSmileComponent, {
            disableClose: false,
        });

        const aSub = bSheet.afterDismissed().subscribe(data => {
            aSub.unsubscribe();
        });
    }

    public leaveRoom(): void {
        this.socketService.emit('leaveRoom', {roomId: this.currentRoom._id});
        this.leaveFromChat.emit(this.currentRoom._id);
    }

    private changeUserStatusOnline(connection: boolean, userId: string): void {
        if (this.users[userId]) {
            this.users[userId]['online'] = connection;
        }
    }

    public roomSettings(): void {
        const curRoom = Object.assign({}, this.currentRoom);
        const dialogRef = this.dialog.open(DialogRoomSettingsComponent, {
            width: '500px',
            height: '550px',
            hasBackdrop: true,
            data: curRoom
        });
        const aSub = dialogRef.afterClosed().subscribe(data => {
            if (data) {
                if (data.delete === undefined) {
                    if (data.title !== this.currentRoom.title) {
                        this.socketService.emit('renameRoom', {roomId: data._id, roomTitle: data.title});
                    }

                    if (data.isPublic !== this.currentRoom.isPublic) {
                        this.socketService.emit('privacyChange', {roomId: data._id, roomPublicity: data.isPublic});
                    }

                    if (data.deletedUsers.length > 0) {
                        data.deletedUsers.forEach(userId => {
                            this.socketService.emit('deleteParticipant', {roomId: data._id, deletedUserId: userId});
                        });
                    }
                } else {
                    this.socketService.emit('roomDelete', {roomId: data.roomId});
                }
            }
            aSub.unsubscribe();
        });
    }

    public addDisabled(args: MenuEventArgs) {
        if (args.item.text === 'Link') {
            args.element.classList.add('e-disabled');
        }
    }

    public onCreated(): void {
        if (Browser.isDevice) {
            this.content = 'Touch hold to open the ContextMenu';
            this.contextmenu.animationSettings.effect = 'ZoomIn';
        } else {
            this.content = 'Right click / Touch hold to open the ContextMenu';
            this.contextmenu.animationSettings.effect = 'SlideDown';
        }
    }

    public onSelectOption(option): void {
        switch (option) {
            case 'edit': {
                this.isEditing = true;
                const editableMessage = this.messages.find(item => item._id === this.lastSelectedMessageId);
                this.input.nativeElement.innerText = editableMessage.content;
                break;
            }
            case 'delete': {
                this.socketService.emit('deleteMessage', {messageId: this.lastSelectedMessageId});
                break;
            }
            default: {
                console.log('DEFAULT');
                break;
            }
        }
    }
}
