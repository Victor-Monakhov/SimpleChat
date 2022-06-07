import {Component, HostBinding, OnInit, ViewChild} from '@angular/core';
import {ChatService} from '../shared/services/chat.service';
import {AuthService} from '../shared/services/auth.service';
import {SocketService} from '../shared/services/socket.service';
import {ContextMenuComponent} from '@syncfusion/ej2-angular-navigations';
import {LocalStorageService} from '../shared/services/local-storage.service';
import {Subject} from 'rxjs';
import {THEMES} from '../shared/enums/theme.enum';
import {SubSink} from 'subsink';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
    @ViewChild('contextmenu') public contextmenu: ContextMenuComponent;
    @HostBinding('class') public theme: string = THEMES.DARK;
    private subs: SubSink = new SubSink();

    public constructor(private chatService: ChatService) {
    }

    public ngOnInit(): void {
        this.subs.add(
            this.chatService.getTheme().subscribe((theme) => this.theme = theme)
        );
        const aSub = this.chatService.getBlacklist().subscribe((blacklist) => {
            LocalStorageService.setBlacklist(blacklist);
            aSub.unsubscribe();
        });
    }

    public contactListTriggerHandler(trigger: boolean): void {
        this.chatService.isContactList.next(trigger);
    }

    public get contactListTrigger$(): Subject<boolean> {
        return this.chatService.isContactList;
    }

    public get isFlipped$(): Subject<boolean> {
        return this.chatService.flipCard;
    }
}
