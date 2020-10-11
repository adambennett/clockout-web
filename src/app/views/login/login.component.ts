import { Component, OnInit } from '@angular/core';
import * as bcrypt from 'bcryptjs';
import {ConnectorService} from '../../services/connector.service';
import {User} from '../../models/User';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  user: User;
  version: string = 'build: 1.0.0';

  constructor(private connector: ConnectorService) { }

  ngOnInit(): void {
    if (sessionStorage.notLoggedIn == 'true') {
      this.error("You're not logged in!");
      sessionStorage.notLoggedIn = false;
    }
  }

  error(message: string): void {
    const element = $('#error-text');
    element.show();
    if (message) {
      element.text(message);
    }
  }

  getLoginInfo(newAcc: boolean): any {
    const username = $('#username').val();
    const password = $('#password').val();
    if (username === '') {
      this.error('Username cannot be blank!');
      return;
    }
    if (newAcc) {
      const salt = bcrypt.genSaltSync(10);
      const hashPass = bcrypt.hashSync(password, salt);
      return {user: username, pass: hashPass, salt: salt};
    } else {
      return {user: username, pass: password};
    }
  }

  createAccount(): void {
    const info = this.getLoginInfo(true);
    const newUser: User = {
      id: 0,
      time: null,
      username: info.user,
      pass: info.pass,
      salt: info.salt,
      employee: ' '
    }
    this.connector.createUser(newUser).subscribe((data) => {
      $('#error-text').hide();
      sessionStorage.loggedIn = 'true';
      sessionStorage.user = JSON.stringify(data);
      window.location.href = '/user-list';
      return;
    }, err => {
      this.error(err.error);
    });
  }

  login(): void {
    const info = this.getLoginInfo(false);
    this.connector.getUser(encodeURIComponent(info.user)).subscribe(data => {
      this.user = data;
      if (this.user && this.user.salt) {
        const hashPass = bcrypt.hashSync(info.pass, this.user.salt);
        if (hashPass === this.user.pass) {
          sessionStorage.loggedIn = 'true';
          sessionStorage.user = JSON.stringify(this.user);
          window.location.href = '/user-list';
          return;
        }
      }
      this.error('Invalid credentials!');
    }, error => {
      this.error('Bad credential request!');
      console.error(error);
    });
  }

}
