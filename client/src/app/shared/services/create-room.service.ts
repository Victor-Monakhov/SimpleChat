import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, filter, Subject, switchMap, tap} from 'rxjs';
import {IUser} from '../models/IUser';
import {ApiService} from './api.service';
import {SubSink} from 'subsink';
import {FormGroup} from '@angular/forms';
import {IParticipantForm} from '../../dialog-adding-room/dialog-adding-room.component';

@Injectable()
export class CreateRoomService implements OnDestroy {
    public focusedInput$: BehaviorSubject<number> = new BehaviorSubject(-1);
    public formChanges$: Subject<FormGroup<IParticipantForm>> = new Subject();
    public searchedUsers$: Subject<IUser[]> = new Subject<IUser[]>();
    public subs: SubSink = new SubSink();
    public selectedUsers: Map<number, IUser> = new Map();
    public inputIds: number[] = [];
    public isSelectUser: boolean = false;

    public constructor(private apiService: ApiService) {
        this.searchedUsersListener();
        this.formChangesListener();
        this.inputListener();
    }

    public ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    public updateFirstFocus(array: number[], index: number): number[] {
        if (array.includes(index)) {
            array.splice(array.indexOf(index), 1);
        }
        array = array.map((item) => {
            if (item > index) {
                --item;
            }
            return item;
        });
        return array;
    }

    public deleteSelectedUser(index: number): void {
        if (this.selectedUsers.has(this.inputIds[index])) {
            this.selectedUsers.delete(this.inputIds[index]);
        }
    }

    public generateInputId(): number {
        return new Date().getTime();
    }

    private formChangesListener(): void {
        this.subs.add(
            this.formChanges$.pipe(
                filter((control) => !!control),
                switchMap((control) => {
                    return control.valueChanges;
                }),
                tap((changes) => {
                    const name = changes['name'] as string;
                    if (name.length > 2) {
                        this.apiService.setUsersSearching(name.trim());
                    }
                })).subscribe()
        );
    }

    private searchedUsersListener(): void {
        this.subs.add(
            this.apiService.getUsersSearchingResult().subscribe((users) => {
                this.searchedUsers$.next(users.filter((user) => {
                        const selectedUsersArr = Array.from(this.selectedUsers.values());
                        for (let i = 0; i < selectedUsersArr.length; ++i) {
                            if (user._id === selectedUsersArr[i]._id) {
                                return false;
                            }
                        }
                        return true;
                    })
                );
            })
        );
    }

    private inputListener(): void {
        this.subs.add(
            this.focusedInput$.subscribe(() => this.searchedUsers$.next([]))
        );
    }
}
