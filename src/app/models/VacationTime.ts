import {User} from './User';

export interface VacationTime {
  id: number;
  vacation: number;
  floating: number;
  personal: number;
  user: User;
  username: string;
}
