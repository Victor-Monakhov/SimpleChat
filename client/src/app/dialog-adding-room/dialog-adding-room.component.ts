import {Component, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ApiService} from '../shared/services/api.service';
import {IUser} from '../shared/models/IUser';
import {UserService} from '../shared/services/user.service';
import {SubSink} from 'subsink';
import {BehaviorSubject, filter, Subject, switchMap, tap} from 'rxjs';
import {PanelService} from '../shared/services/panel.service';


export interface IAddRoomForm {
    title: FormControl<string>;
    participants: FormArray<FormGroup<{ id: FormControl<string>, name: FormControl<string> }>>;
}

@Component({
    selector: 'app-dialog-adding-room',
    templateUrl: './dialog-adding-room.component.html',
    styleUrls: ['./dialog-adding-room.component.scss']
})
export class DialogAddingRoomComponent implements OnInit, OnDestroy {
    private subs: SubSink = new SubSink();
    private formChanges$: Subject<AbstractControl> = new Subject<AbstractControl>();
    public focusedInput$: BehaviorSubject<number> = new BehaviorSubject(-1);
    public selectedUsers: Map<number, IUser> = new Map();
    //public selectedUsers2: Map<string, IUser> = new Map();
    public firstFocusOnInputContainer: number[] = [];
    public form: FormGroup<IAddRoomForm>;
    public searchedUsers: IUser[] = [];
    public isPublic = true;

    public constructor(private fb: FormBuilder,
                       private panelService: PanelService,
                       private userService: UserService,
                       private apiService: ApiService) {
    }

    public ngOnInit(): void {
        this.form = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
            participants: this.fb.array([
                this.fb.group({
                    id: [this.getRandomId(), []],
                    name: ['', [Validators.required]]
                })
            ])
        });
        this.panelService.userSearchingTips.push(new Subject<boolean>());
        this.inputListener();
        this.formChangesListener();
        this.searchedUsersListener();
    }

    public ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    public selectUser(user: IUser): void {
        this.participants.controls[this.focusedInput$.value].get('name').setValue(user.name);
        this.selectedUsers.set(this.focusedInput$.value, user);
    }

    public addParticipant(): void {
        this.panelService.userSearchingTips.push(new Subject<boolean>());
        this.participants.push(this.fb.group({id: [this.getRandomId(), []], name: ['', [Validators.required]]}));
    }

    public switchPrivate(): void {
        this.isPublic = !this.isPublic;
    }

    public deleteParticipant(index: number, control: AbstractControl): void {
        this.participants.removeAt(index);
        this.firstFocusOnInputContainer = this.updateAfterDelete(this.firstFocusOnInputContainer, index);
        this.panelService.userSearchingTips.splice(index, 1);
        if (this.selectedUsers.has(index)) {
            this.selectedUsers.delete(index);
        }
        const tmpSelectedUsers = new Map<number, IUser>()
        Array.from(this.selectedUsers.entries()).forEach((item) => {
            if (item[0] > index) {
                tmpSelectedUsers.set(item[0] - 1, item[1]);
            } else {
                tmpSelectedUsers.set(item[0], item[1]);
            }
        })
        this.selectedUsers = tmpSelectedUsers;
    }

    public onFocusInput(index: number, control: AbstractControl): void {
        this.formChanges$.next(control);
        this.focusedInput$.next(index);
        if (!this.firstFocusOnInputContainer.includes(index)) {
            this.firstFocusOnInputContainer.push(index);
        }
    }

    public tipTriggersHandler(index: number): void {
        this.panelService.userSearchingTips[index].next(false);
    }

    private inputListener(): void {
        this.subs.add(
            this.focusedInput$.subscribe(() => this.searchedUsers = [])
        );
    }

    private formChangesListener(): void {
        this.subs.add(
            this.formChanges$.pipe(
                filter((control) => !!control),
                switchMap((control) => {
                    return control.valueChanges;
                }),
                tap((changes) => {
                    const id = changes['id'] as string;
                    const name = changes['name'] as string;
                    if (name.length > 2) {
                        this.apiService.setUsersSearching(name);
                    } else {
                        this.searchedUsers = [];
                        this.showTips(false);
                    }
                    // if (this.selectedUsers2.has(name) && this.focusedInput$.value >= 0) {
                    //     console.log('hello');
                    this.selectedUsers.delete(this.focusedInput$.value);
                    // this.selectedUsers2.delete(id);
                    // }
                })).subscribe()
        );
    }

    private searchedUsersListener(): void {
        this.subs.add(
            this.userService.searchedUsers$.subscribe((users) => {
                this.searchedUsers = users.filter((user) => {
                    const selectedUsersArr = Array.from(this.selectedUsers.values());
                    for (let i = 0; i < selectedUsersArr.length; ++i) {
                        if (user._id === selectedUsersArr[i]._id) {
                            return false;
                        }
                    }
                    return true;
                });
                this.showTips(!!this.searchedUsers.length);
            })
        );
    }

    private showTips(flag: boolean): void {
        this.panelService.userSearchingTips[this.focusedInput$.value].next(flag);
    }

    private getRandomId(): string {
        return 'id' + new Date().getTime();
    }

    private updateAfterDelete(array: number[], index: number): number[] {
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

    public get tipTriggers(): Subject<boolean>[] {
        return this.panelService.userSearchingTips;
    }

    public get participants(): FormArray {
        return this.form.get('participants') as FormArray;
    }


    public onNoClick(): void {
        //this.dialogRef.close(false);
    }

    public onCreate(): void {
        // this.userIds = this.userIds.filter((userId) => userId !== this.me);
        // this.userIds = Array.from(new Set(this.userIds));
        // // this.dialogRef.close({
        // //     roomTitle: this.addRoomForm.get('title').value,
        // //     participants: this.userIds,
        // //     isPublic: this.isPublic
        // // });
    }


    public validateInputs(): boolean {
        return true;
        // this.userIds = this.userIds.filter((userId) => userId !== this.me);
        // return this.userIds.every((item) => !!item) && this.userIds.length > 0;
    }

}
