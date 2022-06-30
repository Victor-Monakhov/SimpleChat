import {Pipe, PipeTransform} from '@angular/core';
import {IRoom} from '../models/IRoom';

@Pipe({
    name: 'searchRooms'
})
export class SearchRoomsPipe implements PipeTransform {
    public transform(rooms: IRoom[], searchText: string): IRoom[] {
        if (searchText.length > 0) {
            return rooms.filter(room => room.title.toLowerCase().includes(searchText.toLowerCase()));
        } else {
            return rooms;
        }
    }
}
