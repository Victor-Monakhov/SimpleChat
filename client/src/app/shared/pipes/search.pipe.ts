import {Pipe, PipeTransform} from '@angular/core';
import {IRoom} from "../models/IRoom";

@Pipe({
    name: 'search'
})
export class SearchPipe implements PipeTransform {
    transform(rooms: IRoom[], searchText: string): IRoom[] {
        return rooms.filter(room => room.title.toLowerCase().includes(searchText.toLowerCase()));
    }
}
