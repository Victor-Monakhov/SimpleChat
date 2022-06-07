import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ChatService} from '../shared/services/chat.service';
import {AuthService} from '../shared/services/auth.service';
import {SocketService} from '../shared/services/socket.service';
import {ContextMenuComponent} from '@syncfusion/ej2-angular-navigations';
import {LocalStorageService} from '../shared/services/local-storage.service';
import {Subject} from 'rxjs';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, AfterViewInit {
    @ViewChild('cardInner') public card: ElementRef;
    @ViewChild('contextmenu') public contextmenu: ContextMenuComponent;
    public isFlipped: boolean = false;
    public isLoaded: boolean = false;
    public content: string = '';
    public theme: string = 'dark';

    public constructor(private chatService: ChatService,
                       private authService: AuthService,
                       private socketService: SocketService) {
        if (this.authService.isAuthenticated()) {
            this.socketService.connect();
        }
    }

    public ngOnInit(): void {
        this.chatService.init();
        this.chatService.theme.subscribe((selectedTheme) => this.theme = selectedTheme);
        this.chatService.flipCard.subscribe(() => {
            if (this.isLoaded) {
                this.flipCardToggle();
            }
        });
        const aSub = this.chatService.getBlacklist().subscribe((blacklist) => {
            LocalStorageService.setBlacklist(blacklist);
            aSub.unsubscribe();
        });
    }

    public ngAfterViewInit(): void {
        this.isLoaded = true;
    }

    public contactListTriggerHandler(trigger: boolean): void {
        this.chatService.isContactList.next(trigger);
    }

    public flipCardToggle(): void {
        if (!this.isFlipped) {
            this.card.nativeElement.style.transform = 'rotateY(180deg)';
            this.isFlipped = true;
        } else {
            this.card.nativeElement.style.transform = '';
            this.isFlipped = false;
        }
    }

    public get contactListTrigger$(): Subject<boolean> {
        return this.chatService.isContactList;
    }
}
