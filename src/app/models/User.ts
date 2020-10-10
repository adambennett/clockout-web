import {VacationTime} from './VacationTime';

export interface User {
  id: number;
  time: VacationTime;
  username: string;
  pass: string;
  salt: string;
  employee: string;
}
