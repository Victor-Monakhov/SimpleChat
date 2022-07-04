import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {PanelService} from '../../shared/services/panel.service';
import {Subject} from 'rxjs';
import {BreakpointObserver} from '@angular/cdk/layout';
import {WIN_SIZES} from '../../app.config';
import {SubSink} from 'subsink';

@Component({
    selector: 'app-chat-work-space',
    templateUrl: './chat-work-space.component.html',
    styleUrls: ['./chat-work-space.component.scss']
})
export class ChatWorkSpaceComponent implements OnInit, OnDestroy {

    private subs: SubSink = new SubSink();

    public constructor(private panelService: PanelService,
                       private breakpointObserver: BreakpointObserver) {
        this.subs.add(
            breakpointObserver
                .observe([`(min-width: ${WIN_SIZES.MD}px)`])
                .subscribe((screen) => {
                    this.panelService.isDesktopMode = screen.matches;
                    // console.log(screen.matches);
                    // this.panelService.isDesktopMode.subscribe((result)=> console.log(result))
                })
        );
    }

    public ngOnInit(): void {
        return;
    }

    public ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    public openSettings(): void {
        this.isChatSettingsVisible$.next(true);
    }

    public get isChatSettingsVisible$(): Subject<boolean> {
        return this.panelService.isChatSettingsVisible$;
    }

    public get isDesktopMode(): boolean {
        return this.panelService.isDesktopMode;
    }
}
