import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ApiService} from '../shared/services/api.service';
import {IUser} from '../shared/models/IUser';
import {UserService} from '../shared/services/user.service';
import {SubSink} from 'subsink';
import {debounce, filter, of, Subject, switchMap, tap, timer} from 'rxjs';
import {PanelService} from '../shared/services/panel.service';
import {IAddRoomForm, IParticipantForm} from '../shared/interfaces/forms.interface';
import {THEMES} from '../shared/enums/theme.enum';
import {ICreateRoomData} from '../shared/interfaces/create-room-data.interface';

@Component({
    selector: 'app-dialog-adding-room',
    templateUrl: './dialog-adding-room.component.html',
    styleUrls: ['./dialog-adding-room.component.scss']
})
export class DialogAddingRoomComponent implements OnInit, OnDestroy {
    @Input() public theme: string = THEMES.DARK;
    private subs: SubSink = new SubSink();
    private formChanges$: Subject<FormGroup<IParticipantForm>> = new Subject();
    private controlIndex: number = 0;
    private isAttachedUser: boolean = false;
    public form: FormGroup<IAddRoomForm> = {} as FormGroup<IAddRoomForm>;
    public participants: FormArray<FormGroup<IParticipantForm>> = {} as FormArray<FormGroup<IParticipantForm>>;
    public searchedUsers: IUser[] = [];
    public isPublic = true;

    public constructor(private fb: FormBuilder,
                       private panelService: PanelService,
                       private userService: UserService,
                       private apiService: ApiService) {
    }

    public ngOnInit(): void {
        this.initForm();
        this.searchedUsersListener();
        this.formChangesListener();
    }

    public ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    public initForm(): void {
        this.panelService.userSearchingTips = [];
        this.form = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
            participants: this.fb.array([this.getNewParticipantForm()])
        });
        this.participants = this.form.get('participants') as FormArray<FormGroup<IParticipantForm>>;
        this.panelService.userSearchingTips.push(new Subject<boolean>());
    }

    public selectUser(user: IUser): void {
        this.participants.controls[this.controlIndex].get('name').setValue(user.name);
        this.participants.controls[this.controlIndex].get('id').setValue(user._id);
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
    }

    public onFocusInput(index: number, control: FormGroup<IParticipantForm>): void {
        this.formChanges$.next(control);
        this.controlIndex = index;
    }

    public tipTriggersHandler(index: number): void {
        this.panelService.userSearchingTips[index].next(false);
    }

    public onClose(): void {
        this.panelService.isAddingRoom$.next(false);
    }

    public onCreate(): void {
        const usersIds = this.participants.controls.map((control) => {
            return control.get('id').value;
        });
        const createRoomData = {
            roomTitle: this.form.get('title').value,
            participants: usersIds,
            isPublic: this.isPublic
        } as ICreateRoomData;
        this.apiService.createRoom(createRoomData);
        this.initForm();
        this.onClose();
    }

    private showTips(flag: boolean): void {
        this.panelService.userSearchingTips[this.controlIndex].next(flag);
    }

    private getNewParticipantForm(): FormGroup<IParticipantForm> {
        return this.fb.group({
            name: ['', [Validators.required]],
            id: ['', [Validators.required]]
        });
    }

    private attachParticipant(): void {
        const currentControl = this.participants.controls[this.controlIndex];
        const matchingUsers = this.searchedUsers.filter((user) => {
            const isNameMatching = user.name.toLowerCase() === currentControl.get('name').value.toLowerCase();
            const isIdMatching = user._id === currentControl.get('id').value;
            return isNameMatching && !isIdMatching;
        });
        if (matchingUsers.length === 1) {
            this.participants.controls[this.controlIndex].get('id').setValue(matchingUsers[0]._id);
            this.isAttachedUser = true;
        }
    }

    private detachParticipant(): void {
        if (this.participants.controls[this.controlIndex].get('id').value && !this.isAttachedUser) {
            this.participants.controls[this.controlIndex].get('id').setValue('');
        } else {
            this.isAttachedUser = false;
        }
    }

    private formChangesListener(): void {
        this.subs.add(
            this.formChanges$.pipe(
                filter((control) => !!control),
                switchMap((control) => {
                    return control.valueChanges.pipe(
                        debounce(() => timer(500))
                    );
                }),
                switchMap((changes) => {
                    const name = changes['name'] as string;
                    if (name.length > 2) {
                        return this.apiService.searchUsersByNameSubStr(changes['name'] as string);
                    }
                    return of([] as IUser[]);
                }),
                tap((users) => {
                    this.userService.searchedUsers$.next(users);
                })
            ).subscribe()
        );
    }

    private searchedUsersListener(): void {
        this.subs.add(
            this.userService.searchedUsers$.subscribe((users) => {
                this.searchedUsers = users.filter((user) => {
                    return !this.participants.controls.find((control) => {
                        return control.get('id').value === user._id;
                    });
                });
                this.showTips(!!this.searchedUsers.length);
                this.detachParticipant();
                this.attachParticipant();
            })
        );
    }

    public get tipTriggers(): Subject<boolean>[] {
        return this.panelService.userSearchingTips;
    }
}
