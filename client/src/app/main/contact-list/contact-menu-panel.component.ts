import {
    Component, EventEmitter, HostBinding,
    Input, OnDestroy,
    OnInit, Output,
    ViewChild,
} from '@angular/core';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {SocketService} from '../../shared/services/socket.service';
import {ApiService} from '../../shared/services/api.service';
import {AuthService} from '../../shared/services/auth.service';
import {MenuEventArgs, MenuItemModel} from '@syncfusion/ej2-navigations';
import {Browser} from '@syncfusion/ej2-base';
import {ContextMenuComponent} from '@syncfusion/ej2-angular-navigations';
import {LocalStorageService} from '../../shared/services/local-storage.service';
import {BreakpointObserver} from '@angular/cdk/layout';
import {WIN_SIZES} from '../../app.config';
import {SubSink} from 'subsink';
import {PanelService} from '../../shared/services/panel.service';


@Component({
    selector: 'app-contact-menu-panel',
    templateUrl: './contact-menu-panel.component.html',
    styleUrls: ['./contact-menu-panel.component.scss']
})
export class ContactMenuPanelComponent implements OnInit, OnDestroy {
    @ViewChild('contextmenu') public contextmenu: ContextMenuComponent;
    private subs: SubSink = new SubSink();
    private me: string = LocalStorageService.getUser()['id'];
    private blacklist: string[] = [];
    private lastSelectedContactId: string = '';
    private content: string = '';
    public list: object[] = [];
    public roomId: string = '';
    public config: PerfectScrollbarConfigInterface = {wheelSpeed: 0.2, scrollingThreshold: 0};
    public menuItems: MenuItemModel[] = [
        {
            id: 'invite',
            text: 'Invite to the chat',
            iconCss: 'e-cm-icons e-add'
        },
        {
            separator: true
        },
        {
            id: 'ban',
            text: 'Add to blacklist',
            iconCss: 'e-cm-icons e-ban'
        }];

    public constructor(private socketService: SocketService,
                private apiService: ApiService,
                private panelService: PanelService,
                private authService: AuthService,
                private breakpointObserver: BreakpointObserver) {
        this.subs.add(
            breakpointObserver
                .observe([`(min-width: ${WIN_SIZES.MD}px)`])
                .subscribe(() => {
                    this.onClose();
                })
        );
    }

    public ngOnInit(): void {
        if (this.authService.isAuthenticated()) {
            this.blacklist = LocalStorageService.getBlacklist();
            this.apiService.currentRoomUsers.subscribe(users => {
                this.list = users;
            });
        }
    }

    public ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    public onClose(): void {
        this.panelService.isContactMenu$.next(false);
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

    public onSelect(e): void {
        if (this.lastSelectedContactId !== this.me) {
            if (e.item.properties.id === 'invite') {
                console.log(`User with id: ${this.lastSelectedContactId} was invited`);
            } else if (e.item.properties.id === 'ban') {
                if (this.blacklist.indexOf(this.lastSelectedContactId) >= 0) {
                    this.deleteFromBlacklist();
                } else {
                    this.addToBlacklist();
                }
            }
        }
    }

    public addToBlacklist(): void {
        this.apiService.addToBlacklist(this.lastSelectedContactId).subscribe(response => {
            LocalStorageService.setBlacklist(response);
            this.blacklist = response;
        });
    }

    public deleteFromBlacklist(): void {
        this.apiService.deleteFromBlacklist(this.lastSelectedContactId).subscribe(response => {
            LocalStorageService.setBlacklist(response);
            this.blacklist = response;
        });
    }

    public onContactRightClick(user: object): void {
        this.lastSelectedContactId = user['userId'];
        if (this.lastSelectedContactId === this.me) {
            this.menuItems[0].text = '***You can not invite or';
            this.menuItems[0].iconCss = '';
            this.menuItems[2].text = 'add yourself to blacklist***';
            this.menuItems[2].iconCss = '';
            this.contextmenu.items = this.menuItems;
        } else {
            this.menuItems[0].text = 'Invite to the chat';
            this.menuItems[0].iconCss = 'e-cm-icons e-add';
            if (this.blacklist.indexOf(this.lastSelectedContactId) >= 0) {
                this.menuItems[2].text = 'Remove from blacklist';
                this.menuItems[2].iconCss = 'e-cm-icons e-add';
            } else {
                this.menuItems[2].text = 'Add to blacklist';
                this.menuItems[2].iconCss = 'e-cm-icons e-ban';
            }
            this.contextmenu.items = this.menuItems;
        }
    }
}
