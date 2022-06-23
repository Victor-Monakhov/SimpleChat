import {FormArray, FormControl, FormGroup} from '@angular/forms';

export interface IParticipantForm {
    name: FormControl<string>;
    id: FormControl<string>;
}

export interface IAddRoomForm {
    title: FormControl<string>;
    participants: FormArray<FormGroup<IParticipantForm>>;
}
