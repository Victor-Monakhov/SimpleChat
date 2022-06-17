import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ApiService} from '../shared/services/api.service';
import {IUser} from '../shared/models/IUser';
import {UserService} from '../shared/services/user.service';
import {SubSink} from 'subsink';
import {BehaviorSubject, filter, Subject, switchMap, tap} from 'rxjs';


export interface IAddRoomForm{
    title: FormControl<string>;
    participants: FormArray<FormGroup<{id: FormControl<string>, name: FormControl<string>}>>;
}

@Component({
    selector: 'app-dialog-adding-room',
    templateUrl: './dialog-adding-room.component.html',
    styleUrls: ['./dialog-adding-room.component.scss']
})
export class DialogAddingRoomComponent implements OnInit, OnDestroy {
    private subs: SubSink = new SubSink();
    private formChanges$: Subject<FormControl> = new Subject<FormControl>();
    public focusedInput$: BehaviorSubject<number> = new BehaviorSubject(-1);
    public selectedUsers: Map<number, IUser> = new Map();
    public selectedUsers2: Map<string, IUser> = new Map();
    public firstFocusOnInputContainer: number[] = [];
    public form: FormGroup<IAddRoomForm>;
    public participants: FormArray = {} as FormArray;
    public searchedUsers: IUser[] = [];
    public isPublic = true;

    public constructor(private fb: FormBuilder,
                    private userService: UserService,
                    private apiService: ApiService) {}

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
        this.participants = this.form.get('participants') as FormArray;
        this.inputListener();
        this.formChangesListener();
        this.searchedUsersListener();
    }

    public ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    public selectUser(control: FormControl, user: IUser): void {
        control.get('name').setValue(user.name);
        this.selectedUsers2.set(control.get('id').value, user);
    }

    public addParticipant(): void {
        this.participants.push(this.fb.group({id: [this.getRandomId(), []], name: ['', [Validators.required]]}));
    }

    public switchPrivate(): void {
        this.isPublic = !this.isPublic;
    }

    public deleteParticipant(index: number, control: FormControl): void {
        this.participants.removeAt(index);
        if (this.firstFocusOnInputContainer.includes(index)) {
            this.firstFocusOnInputContainer.splice(this.firstFocusOnInputContainer.indexOf(index), 1);
        }
        this.firstFocusOnInputContainer = this.firstFocusOnInputContainer.map((item) => {
            if (item > index) {
                --item;
            }
            return item;
        });
        if (this.selectedUsers2.has(control.get('id').value)) {
            this.selectedUsers2.delete(control.get('id').value);
        }
    }

    public onFocusInput(index: number, control: FormControl): void {
        this.formChanges$.next(control);
        this.focusedInput$.next(index);
        if (!this.firstFocusOnInputContainer.includes(index)) {
            this.firstFocusOnInputContainer.push(index);
        }
    }

    public onReseteFocusInput(): void {
        setTimeout(() => this.focusedInput$.next(-1), 300);
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
                    }
                    // if (this.selectedUsers2.has(name) && this.focusedInput$.value >= 0) {
                    //     console.log('hello');
                        
                    this.selectedUsers2.delete(id);
                    // }
                })).subscribe()
        );
    }

    private searchedUsersListener(): void {
        this.subs.add(
            this.userService.searchedUsers$.subscribe((users) => {
                this.searchedUsers = users.filter((user) => {
                    const selectedUsersArr = Array.from(this.selectedUsers2.values());
                    for (let i = 0; i < selectedUsersArr.length; ++i) {
                        if (user._id === selectedUsersArr[i]._id) {
                            return false;
                        }
                    }
                    return true;
                })
            })
        );
    }

    private getRandomId(): string {
        return 'id' + new Date().getTime();
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
