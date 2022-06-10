import {Directive, HostListener, Input} from '@angular/core';
import {ApiService} from '../services/api.service';

@Directive({
    selector: '[context-menu]',
})
export class ContextMenuDirective {
    @Input('context-menu') options;
    @Input() isMyMessage: boolean = true;

    constructor(private chatService: ApiService) {
    }

    @HostListener('contextmenu', ['$event']) public rightClicked(event: MouseEvent): void {
        event.preventDefault();
        if (this.isMyMessage) {
            this.chatService.showContextMenu.next({event, options: this.options});
        }
    }
}
