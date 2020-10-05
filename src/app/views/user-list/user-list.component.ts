import {Component, OnInit, ViewChild} from '@angular/core';
import {ConnectorService} from '../../services/connector.service';
import {ActivatedRoute, Router} from '@angular/router';
import {User} from '../../models/User';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

  users: User[] = [];
  displayedColumns: string[] = ['user', 'vacation', 'personal', 'floating'];
  dataSource: MatTableDataSource<User>;
  increment = 1;

  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private connector: ConnectorService) { }

  ngOnInit(): void {
    this.reset();
  }

  goToUrl(url: string, newTab: boolean): void {
    if (newTab) {
      window.open(url, "_blank");
    } else {
      window.open(url);
    }
  }

  addHours(employee: string, timeType: string): void {
    for (const user of this.users) {
      if (user.employee === employee) {
        user.time[timeType] += this.increment;
      }
    }
  }

  subHours(employee: string, timeType: string): void {
    for (const user of this.users) {
      if (user.employee === employee) {
        user.time[timeType] -= this.increment;
      }
    }
  }

  reset(): void {
    this.users = [];
    if (sessionStorage.loggedIn == 'true') {
      const user = JSON.parse(sessionStorage.user);
      this.users.push(user);
      this.dataSource = new MatTableDataSource<User>(this.users);
      this.dataSource.sort = this.sort;
    } else {
      sessionStorage.notLoggedIn = true;
      this.returnToLogin();
    }
  }

  returnToLogin(): void {
    sessionStorage.loggedIn = 'false';
    sessionStorage.user = null;
    window.location.href = '/';
    return;
  }

  save(): void {}

  changePassword(): void {}

  setDisplayName(): void {}

  logout(): void {
    this.users = [];
    this.returnToLogin();
  }
}
