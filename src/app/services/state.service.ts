import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  public timeType: string;
  public timeProp: string;
  public showingDays: boolean;

  constructor() { }
}
