import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {User} from '../models/User';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConnectorService {

  public API = environment.localhost ? 'http://localhost:8080/' : 'https://nmi-clockout-api.herokuapp.com/';

  constructor(public http: HttpClient) {}

  getUser(username: string): Observable<User> {
    return this.http.get<User>(this.API + 'getUser/' + username);
  }

  createUser(user: User): Observable<HttpResponse<any>> {
    return this.http.post<any>(this.API + 'newUser', user, {});
  }

  getUsers(): Observable<HttpResponse<User[]>> {
    return this.http.get<User[]>(this.API + 'getUsers', {observe: 'response'});
  }

  updateUserTime(user: User): Observable<HttpResponse<User>> {
    return this.http.post<any>(this.API + 'updateUserTime', user, {});
  }
}
