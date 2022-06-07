import {Pipe, PipeTransform} from '@angular/core';
import {IRoom} from "../models/IRoom";

@Pipe({
    name: 'updateRooms'
})
export class UpdateRoomsPipe implements PipeTransform {
    transform(rooms: IRoom[]): IRoom[] {
        rooms.sort((prevRoom, nextRoom) => {
            if (prevRoom.lastAction < nextRoom.lastAction) {
                return 1;
            } else if (prevRoom.lastAction > nextRoom.lastAction) {
                return -1;
            } else {
                return 0;
            }
        });
        return rooms;
    }
}
