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
    public form: FormGroup<IAddRoomForm>;
    public selectedInput: number = -1;
    public selectedUsers: IUser[] = [];
    public searchedUsers: IUser[] = [];
    public participants: FormArray = {} as FormArray;
    public userIds: any[] = [false];
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
        this.formChangesListener();
        this.searchedUsersListener();
    }

    public ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    public selectUser(user: IUser): void {
        if (this.selectedInput >= 0) {
            this.selectedUsers.push(user);
            this.participants.controls[this.selectedInput].get('name').setValue(user.name);
        }
    }

    public addParticipant(): void {
        this.participants.push(this.fb.group({name: ['', [Validators.required]]}));
    }

    public switchPrivate(): void {
        this.isPublic = !this.isPublic;
    }

    public deleteParticipant(index: number): void {
        this.selectedInput = -1;
        this.participants.removeAt(index);
    }

    private formChangesListener(): void {
        this.subs.add(
            this.form.valueChanges.subscribe((changes) => {
                if (this.selectedInput >= 0) {
                    const name = changes.participants[this.selectedInput].name;
                    if (name.length > 2) {
                        this.apiService.setUsersSearching(name);
                    }
                }
            })
        );
    }

    private searchedUsersListener(): void {
        this.subs.add(
            this.userService.searchedUsers$.subscribe((users) => {
                this.searchedUsers = users.filter((user) => {
                    for (let i = 0; i < this.selectedUsers.length; ++i) {
                        if (user._id === this.selectedUsers[i]._id) {
                            return false;
                        }
                    }
                    return true;
                })
            })
        );
    }

    public in: number = 0;

    

   

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
