import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {ApiService} from '../shared/services/api.service';
import {IUser} from '../shared/models/IUser';
import {UserService} from '../shared/services/user.service';
import {SubSink} from 'subsink';
import {BehaviorSubject, Subject} from 'rxjs';
import {PanelService} from '../shared/services/panel.service';
import {CreateRoomService} from '../shared/services/create-room.service';
import {VMValidator} from '../shared/classes/vm-validator.class';


export interface IParticipantForm {
    name: FormControl<string>;
}

export interface IAddRoomForm {
    title: FormControl<string>;
    participants: FormArray<FormGroup<IParticipantForm>>;
}

@Component({
    selector: 'app-dialog-adding-room',
    templateUrl: './dialog-adding-room.component.html',
    styleUrls: ['./dialog-adding-room.component.scss'],
    providers: [CreateRoomService]
})
export class DialogAddingRoomComponent implements OnInit, OnDestroy {
    private subs: SubSink = new SubSink();
    public form: FormGroup<IAddRoomForm>;
    public isPublic = true;

    public constructor(private fb: FormBuilder,
                       private panelService: PanelService,
                       private userService: UserService,
                       private apiService: ApiService,
                       private createRoomService: CreateRoomService) {
    }

    public ngOnInit(): void {
        this.form = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
            participants: this.fb.array([this.getNewParticipantForm()])
        });
        this.panelService.userSearchingTips.push(new Subject<boolean>());
        this.searchedUsersListener();
    }

    public ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    public selectUser(user: IUser): void {
        this.createRoomService.isSelectUser = true;
        this.participants.controls[this.focusedInput$.value].get('name').setValue(user.name);
    }

    public addParticipant(): void {
        this.panelService.userSearchingTips.push(new Subject<boolean>());
        this.participants.push(this.getNewParticipantForm());
    }

    public switchPrivate(): void {
        this.isPublic = !this.isPublic;
    }

    public deleteParticipant(index: number): void {
        this.participants.removeAt(index);
        this.panelService.userSearchingTips.splice(index, 1);
        this.createRoomService.deleteSelectedUser(index);
        this.createRoomService.inputIds.splice(index, 1);
    }

    public onFocusInput(index: number, control: FormGroup<IParticipantForm>): void {
        this.createRoomService.formChanges$.next(control);
        this.focusedInput$.next(index);
    }

    public tipTriggersHandler(index: number): void {
        this.panelService.userSearchingTips[index].next(false);
    }

    public checkSelectedUser(inputId: number): () => boolean {
        return () => this.selectedUsers.has(inputId);
    }

    public onClose(): void {
        this.panelService.isAddingRoom$.next(false);
    }

    private showTips(flag: boolean): void {
        this.panelService.userSearchingTips[this.focusedInput$.value].next(flag);
    }

    private getNewParticipantForm(): FormGroup<IParticipantForm> {
        return this.fb.group({
            name: ['', [
                Validators.required,
                VMValidator.flag(this.checkSelectedUser(this.getInputId()))
            ]]
        });
    }

    private searchedUsersListener(): void {
        this.createRoomService.subs.add(
            this.createRoomService.searchedUsers$.subscribe((users) => {
                this.showTips(!!users.length);
                const name = this.participants.controls[this.focusedInput$.value].get('name').value;
                const isUser = this.selectedUsers.has(this.inputIds[this.focusedInput$.value]);
                const isSelectUser = this.createRoomService.isSelectUser;
                let isNamesMatch = false;
                users.forEach((user) => {
                    isNamesMatch = name.toLowerCase() === user.name.toLowerCase();
                    if (isNamesMatch || isSelectUser) {
                        this.selectedUsers.set(this.inputIds[this.focusedInput$.value], user);
                    }
                });
                if (isUser && !isNamesMatch && users.length) {
                    this.selectedUsers.delete(this.inputIds[this.focusedInput$.value]);
                }
                if (isSelectUser || isNamesMatch) {
                    this.participants.controls[this.focusedInput$.value].get('name').setValue(name);
                    this.createRoomService.isSelectUser = false;
                }
            })
        );
    }

    private getInputId(): number {
        const id = this.createRoomService.generateInputId();
        this.createRoomService.inputIds.push(id);
        return id;
    }

    public get tipTriggers(): Subject<boolean>[] {
        return this.panelService.userSearchingTips;
    }

    public get participants(): FormArray<FormGroup<IParticipantForm>> {
        return this.form.get('participants') as FormArray<FormGroup<IParticipantForm>>;
    }

    public get selectedUsers(): Map<number, IUser> {
        return this.createRoomService.selectedUsers;
    }

    public get searchedUsers$(): Subject<IUser[]> {
        return this.createRoomService.searchedUsers$;
    }

    public get focusedInput$(): BehaviorSubject<number> {
        return this.createRoomService.focusedInput$;
    }

    public get inputIds(): number[] {
        return this.createRoomService.inputIds;
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
