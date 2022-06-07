import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AuthGuard} from './shared/classes/auth.guard';
import {MainComponent} from './main/main.component';
import {AuthComponent} from './auth/auth.component';
import {NAVIGATE} from './app.config';


const routes: Routes = [
    {
        path: '',
        redirectTo: `/${NAVIGATE.CHAT}`,
        pathMatch: 'full'
    },
    {
        path: NAVIGATE.WELCOME,
        loadChildren: () => import('./modules/welcome/welcome.module').then(m => m.WelcomeModule),
    },
    // {
    //     path: NAVIGATE.CHAT,
    //     loadChildren: () => import('./modules/chat/chat.module').then(m => m.ChatModule),
    // },

    {path: NAVIGATE.CHAT, component: MainComponent, canActivate: [AuthGuard]},

    {path: NAVIGATE.AUTH, component: AuthComponent},
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
