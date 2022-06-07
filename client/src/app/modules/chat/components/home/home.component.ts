import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ContextMenuComponent} from '@syncfusion/ej2-angular-navigations';
import {ChatService} from '../../../../shared/services/chat.service';
import {AuthService} from '../../../../shared/services/auth.service';
import {SocketService} from '../../../../shared/services/socket.service';
import {LocalStorageService} from '../../../../shared/services/local-storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    public ngOnInit(): void {
        return;
    }
}
