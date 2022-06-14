import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {SocketService} from '../shared/services/socket.service';
import {LocalStorageService} from '../shared/services/local-storage.service';
import {ApiService} from '../shared/services/api.service';
import {IUser} from '../shared/models/IUser';


export interface IAddParticipent{
    name: FormControl<string>;
}
export interface IAddRoomForm{
    title: FormControl<string>;
    participants: FormArray<FormGroup<IAddParticipent>>;
}

@Component({
    selector: 'app-dialog-adding-room',
    templateUrl: './dialog-adding-room.component.html',
    styleUrls: ['./dialog-adding-room.component.scss']
})
export class DialogAddingRoomComponent implements OnInit {
    private me = LocalStorageService.getUser()['id'];
    public form: FormGroup<IAddRoomForm>;
    public selectedInput: number = -1;
    public searchedUsers: any;
    public userIds: any[] = [false];
    public isPublic = true;

    public constructor(private fb: FormBuilder,
                    private socketService: SocketService) {}

    public ngOnInit(): void {
        this.form = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
            participants: this.fb.array([
                this.fb.group({name: ['', [Validators.required]]})
            ])
        });
        this.onSearch();

        this.socketService.listen('searchResult').subscribe((users) => {
            console.log(users);
            
            // if (users.length === 1 && this.form.get('participants').value[this.selectedInput].name === users[0].name) {
            //    // this.userIds[this.selectedInput] = users[0]._id;
            // } else {
            //     this.searchedUsers = users.filter((user) => user._id !== this.me);
            //  //   this.userIds[this.selectedInput] = false;
            // }
        });
    }

    public pushId(user: IUser): void {
        // this.userIds[this.selectedInput] = userId;
        // this.form.controls['participants'][this.selectedInput].setValue(user.name);
        console.log((this.form.get('participants') as FormArray).controls[this.selectedInput]);
    }

    public onSearch(): void {
        this.form.valueChanges.subscribe((changes) => {
            if (this.selectedInput >= 0 && changes.participants[this.selectedInput].name.length > 2) {
                    this.socketService.emit('searchUsers', changes.participants[this.selectedInput].name);
            }
        });
    }

    public addParticipant(): void {
        this.participants.push(this.fb.group({name: ['', [Validators.required]]}));
        // this.userIds.push(false);
    }

    public switchPrivate(): void {
        this.isPublic = !this.isPublic;
    }

    public deleteParticipant(index: number): void {
        this.selectedInput = null;
        this.participants.removeAt(index);
        // this.userIds.splice(index, 1);
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
