import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppRoutingModule} from "./app-routing.module";
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatTabsModule} from "@angular/material/tabs";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatListModule} from "@angular/material/list";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatToolbarModule} from "@angular/material/toolbar";
import {PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {PERFECT_SCROLLBAR_CONFIG} from 'ngx-perfect-scrollbar';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {MainComponent} from './main/main.component';
import {HeaderComponent} from './main/header/header.component';
import {ChatComponent} from './main/chat/chat.component';
import {ContactMenuPanelComponent} from './main/contact-menu-panel/contact-menu-panel.component';
import {RoomComponent} from './main/room/room.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {SmilesComponent} from './main/smiles/smiles.component';
import {MatCardModule} from "@angular/material/card";
import {AuthComponent} from './auth/auth.component';
import {TokenInterceptor} from "./shared/classes/token.interceptor";
import {SetReferenceDirective} from './shared/directives/set-reference.directive';
import {MAT_DIALOG_DEFAULT_OPTIONS, MatDialogModule} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {DialogAddingRoomComponent} from './dialog-adding-room/dialog-adding-room.component';
import {DialogInvitationComponent} from './dialog-invitation/dialog-invitation.component';
import {MatChipsModule} from "@angular/material/chips";
import {MatIconModule} from "@angular/material/icon";
import {EmojifyModule} from "angular-emojify";
import {MatRippleModule} from "@angular/material/core";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {ChatSettingsPanelComponent} from './main/chat-settings-panel/chat-settings-panel.component';
import {DialogInvitingRoomComponent} from './dialog-inviting-room/dialog-inviting-room.component';
import {SearchRoomsPipe} from './shared/pipes/search-rooms.pipe';
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {DialogRoomSettingsComponent} from './dialog-room-settings/dialog-room-settings.component';
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {ContextMenuModule} from "@syncfusion/ej2-angular-navigations";
import {MatBadgeModule} from "@angular/material/badge";
import {MessageItemComponent} from './main/room/message-item/message-item.component';
import {NguiParallaxScrollModule} from "@ngui/parallax-scroll";
import {InViewportModule} from "@thisissoon/angular-inviewport";
import {MatSidenavModule} from "@angular/material/sidenav";
import { SortRoomsByActionPipe } from './shared/pipes/sort-rooms-by-action.pipe';
import {DeviceDetectorModule} from "ngx-device-detector";
import {MAT_BOTTOM_SHEET_DEFAULT_OPTIONS, MatBottomSheetModule} from "@angular/material/bottom-sheet";
import {MatMenuModule} from "@angular/material/menu";
import { MobileSmileComponent } from './main/mobile-smile/mobile-smile.component';
import {CustomContextMenuComponent} from "./shared/components/custom-context-menu/custom-context-menu.component";
import {ContextMenuDirective} from "./shared/directives/context-menu.directive";
import { DropPanelDirective } from './shared/directives/drop-panel.directive';
import { DropPanelComponent } from './shared/components/drop-panel/drop-panel.component';
import {OverlayModule} from '@angular/cdk/overlay';
import { UsersSearchTipComponent } from './dialog-adding-room/users-search-tip/users-search-tip.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
    suppressScrollX: true
};

@NgModule({
    declarations: [
        AppComponent,
        MainComponent,
        HeaderComponent,
        ChatComponent,
        ContactMenuPanelComponent,
        RoomComponent,
        SmilesComponent,
        AuthComponent,
        SetReferenceDirective,
        DialogAddingRoomComponent,
        DialogInvitationComponent,
        ChatSettingsPanelComponent,
        DialogInvitingRoomComponent,
        SearchRoomsPipe,
        DialogRoomSettingsComponent,
        MessageItemComponent,
        SortRoomsByActionPipe,
        MobileSmileComponent,
        CustomContextMenuComponent,
        ContextMenuDirective,
        DropPanelDirective,
        DropPanelComponent,
        UsersSearchTipComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatToolbarModule,
        MatListModule,
        MatTabsModule,
        MatFormFieldModule,
        MatInputModule,
        PerfectScrollbarModule,
        HttpClientModule,
        MatCardModule,
        AppRoutingModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatChipsModule,
        MatIconModule,
        MatRippleModule,
        MatAutocompleteModule,
        MatSlideToggleModule,
        MatProgressSpinnerModule,
        EmojifyModule,
        MatCheckboxModule,
        MatButtonToggleModule,
        ContextMenuModule,
        MatBadgeModule,
        NguiParallaxScrollModule,
        InViewportModule,
        MatSidenavModule,
        DeviceDetectorModule.forRoot(),
        MatBottomSheetModule,
        MatMenuModule,
        OverlayModule
    ],
    entryComponents: [
        DialogAddingRoomComponent,
        DialogInvitationComponent,
        DialogInvitingRoomComponent,
        DialogRoomSettingsComponent,
        MobileSmileComponent
    ],
    providers: [
        {
            provide: PERFECT_SCROLLBAR_CONFIG,
            useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
        },
        {
            provide: HTTP_INTERCEPTORS,
            multi: true,
            useClass: TokenInterceptor
        },
        {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: false}},
        {provide: MAT_BOTTOM_SHEET_DEFAULT_OPTIONS, useValue: {hasBackdrop: true}}
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
