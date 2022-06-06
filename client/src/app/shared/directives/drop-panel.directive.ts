import {
    Directive,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    Optional,
    Output,
    SimpleChanges,
    TemplateRef,
    ViewContainerRef,
} from '@angular/core';
import {IDropPanel} from '../interfaces/drop-panel.interface';
import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {merge, Observable} from 'rxjs';

@Directive({
    selector: '[dropPanel]',

    host: {
        '(click)': 'onDrop(true)'
    }
})
export class DropPanelDirective implements OnChanges {

    @Input() public dropPanel: IDropPanel;
    @Input() public trigger: boolean = false;
    @Input() public staticBackdrop: boolean = true;
    @Output() public triggerEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
    private isClick: boolean = false;
    private closeHandler;

    constructor (public overlay: Overlay,
                public elementRef: ElementRef,
                public viewContainerRef: ViewContainerRef,
                @Optional() public overlayRef: OverlayRef) {

    }

    ngOnChanges (changes: SimpleChanges) {
        if (this.trigger) {
            this.onDrop(false);
        } else if (!this.isClick) {
            this.destroyMenu();
        }
    }

    public onDrop(flag: boolean) {
        this.isClick = flag;
        this.openMenu();
        this.dropPanel.anim = true;
    }

    private openMenu() {
        this.dropPanel.visible.next(true);
        this.overlayRef = this.overlay.create({
            hasBackdrop: true,
            scrollStrategy: this.overlay.scrollStrategies.block(),
            positionStrategy: this.overlay
                .position()
                .flexibleConnectedTo(this.elementRef)
                .withPositions([
                    {
                        originX: 'end',
                        originY: 'bottom',
                        overlayX: 'end',
                        overlayY: 'top'
                    }
                ])
        });
        const templatePortal = new TemplatePortal(
            this.dropPanel.templateRef as TemplateRef<any>,
            this.viewContainerRef
        );
        this.overlayRef.attach(templatePortal);
        this.closeHandler = this.dropdownClosingActions().subscribe(
            () => this.destroyMenu()
        );
    }

    private dropdownClosingActions(): Observable<MouseEvent | void> {
        const backdropClick$ = this.overlayRef.backdropClick();
        const detachment$ = this.overlayRef.detachments();
        const closeMenu$ = this.dropPanel.closed;
        if (this.staticBackdrop) {
            return merge(detachment$, closeMenu$);
        }
        return merge(backdropClick$, detachment$, closeMenu$);
    }

    private destroyMenu() {
        if (!this.overlayRef) {
            return;
        }
        this.dropPanel.anim = false;
        this.isClick = false;
        setTimeout(() => {
            this.triggerEvent.emit(false);
            this.closeHandler.unsubscribe();
            this.overlayRef.detach();
            this.dropPanel.visible.next(false);
        }, 500);
    }
}
