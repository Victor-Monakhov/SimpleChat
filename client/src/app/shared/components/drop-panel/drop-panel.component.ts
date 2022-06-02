import {Component, EventEmitter, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {IDropPanel} from '../../interfaces/drop-panel.interface';
import {Subject} from 'rxjs';

@Component({
    selector: 'app-drop-panel',
    templateUrl: './drop-panel.component.html',
    styleUrls: ['./drop-panel.component.scss']
})
export class DropPanelComponent implements OnInit, IDropPanel {

    @ViewChild(TemplateRef, {static: false})  templateRef: TemplateRef<any> = {} as TemplateRef<any>;
    public closed: EventEmitter<void> = new EventEmitter<void>();
    public visible: Subject<boolean> = new Subject<boolean>();
    public anim: boolean = false;

    constructor() {
    }

    ngOnInit() {
    }

}
