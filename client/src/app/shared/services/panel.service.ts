import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PanelService {
    public isContactMenu$: Subject<boolean> = new Subject<boolean>();
    public isContactMenuFlipped$: Subject<boolean> = new Subject<boolean>();
    public isAddingRoom$: Subject<boolean> = new Subject<boolean>();

    public constructor() {
    }
}
