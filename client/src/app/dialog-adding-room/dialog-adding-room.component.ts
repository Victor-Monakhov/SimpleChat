import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {SocketService} from '../shared/services/socket.service';
import {LocalStorageService} from '../shared/services/local-storage.service';
import {ApiService} from '../shared/services/api.service';
import {IUser} from '../shared/models/IUser';
import {UserService} from '../shared/services/user.service';
import {SubSink} from 'subsink';
import {BehaviorSubject} from 'rxjs';


export interface IAddRoomForm{
    title: FormControl<string>;
    participants: FormArray<FormGroup<{name: FormControl<string>}>>;
}

@Component({
    selector: 'app-dialog-adding-room',
    templateUrl: './dialog-adding-room.component.html',
    styleUrls: ['./dialog-adding-room.component.scss']
})
export class DialogAddingRoomComponent implements OnInit, OnDestroy {
    private subs: SubSink = new SubSink();
    private me = LocalStorageService.getUser()['id'];
    public selectedUsers: Map<number, IUser> = new Map();
    public selectedInput$: BehaviorSubject<number> = new BehaviorSubject(-1);
    public focusedInput: number = -1;
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
                this.fb.group({name: ['', [Validators.required]]})
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

    public selectUser(user: IUser): void {
        const selectedInput = this.selectedInput$.value;
        if (selectedInput >= 0) {
            this.participants.controls[selectedInput].get('name').setValue(user.name);
            this.selectedUsers.set(selectedInput, user);
        }
    }

    public addParticipant(): void {
        this.participants.push(this.fb.group({name: ['', [Validators.required]]}));
    }

    public switchPrivate(): void {
        this.isPublic = !this.isPublic;
    }

    public deleteParticipant(index: number): void {
        this.selectedInput$.next(-1);
        this.participants.removeAt(index);
    }

    public onFocusInput(index: number): void {
        this.focusedInput = index;
        this.selectedInput$.next(index);
    }

    public onReseteFocusInput(): void {
        setTimeout(() => this.focusedInput = -1, 300);
    }

    private inputListener(): void {
        this.subs.add(
            this.selectedInput$.subscribe(() => this.searchedUsers = [])
        );
    }

    private formChangesListener(): void {
        this.subs.add(
            this.form.valueChanges.subscribe((changes) => {
                const selectedInput = this.selectedInput$.value;
                if (selectedInput >= 0) {
                    const name = changes.participants[selectedInput].name;
                    if (name.length > 2) {
                        this.apiService.setUsersSearching(name);
                    } else {
                        this.searchedUsers = [];
                    }
                    if (this.selectedUsers.has(selectedInput) && selectedInput === this.focusedInput) {
                        this.selectedUsers.delete(selectedInput);
                    }
                }
            })
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
                })
            })
        );
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
