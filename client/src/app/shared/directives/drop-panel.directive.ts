import {
    Directive,
    ElementRef,
    EventEmitter, HostListener,
    Input,
    OnChanges,
    Optional,
    Output,
    SimpleChanges,
    TemplateRef,
    ViewContainerRef
} from '@angular/core';
import {IDropPanel} from '../interfaces/drop-panel.interface';
import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {merge, Observable} from 'rxjs';
import {SubSink} from 'subsink';

@Directive({
    selector: '[dropPanel]'
})
export class DropPanelDirective implements OnChanges {

    @Input() public dropPanel: IDropPanel;
    @Input() public trigger: boolean = false;
    @Input() public staticBackdrop: boolean = true;
    @Output() public triggerEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
    private subs: SubSink = new SubSink();
    private isClick: boolean = false;

    public constructor(public overlay: Overlay,
                public elementRef: ElementRef,
                public viewContainerRef: ViewContainerRef,
                @Optional() public overlayRef: OverlayRef) {

    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (this.trigger) {
            this.onDrop(false);
        } else if (!this.isClick) {
            this.destroyMenu();
        }
    }

    private onDrop(flag: boolean): void {
        this.isClick = flag;
        this.openMenu();
        this.dropPanel.anim = true;
    }

    private openMenu(): void {
        this.dropPanel.visible.next(true);
        this.overlayRef = this.overlay.create({
            hasBackdrop: true,
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
                ]),
            scrollStrategy: this.overlay.scrollStrategies.block()
        });
        const templatePortal = new TemplatePortal(
            this.dropPanel.templateRef as TemplateRef<any>,
            this.viewContainerRef
        );
        this.overlayRef.attach(templatePortal);
        this.subs.add(
            this.dropdownClosingActions().subscribe(
                () => this.destroyMenu()
            )
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

    private destroyMenu(): void {
        if (!this.overlayRef) {
            return;
        }
        this.dropPanel.anim = false;
        this.isClick = false;
        setTimeout(() => {
            this.triggerEvent.emit(false);
            this.subs.unsubscribe();
            this.overlayRef.detach();
            this.dropPanel.visible.next(false);
        }, 500);
    }

    @HostListener('click')
    private onClick(): void {
        this.onDrop(true);
    }
}
