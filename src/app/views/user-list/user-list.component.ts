import {Component, OnInit, ViewChild} from '@angular/core';
import {ConnectorService} from '../../services/connector.service';
import {ActivatedRoute, Router} from '@angular/router';
import {User} from '../../models/User';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

  users: User[] = [];
  showingDays: boolean = false;
  displayedColumns: string[] = ['user', 'vacation', 'personal', 'floating'];
  dataSource: MatTableDataSource<User>;
  increment = 1;
  dayTimeInfo: number[] = [];

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

  calculateDayTimeInfo(): void {
    this.dayTimeInfo = [];
    this.dayTimeInfo.push(this.users[0].time.vacation / 8);
    this.dayTimeInfo.push(this.users[0].time.personal / 8);
    this.dayTimeInfo.push(this.users[0].time.floating / 8);
  }

  addHours(employee: string, timeType: string): void {
    for (const user of this.users) {
      if (user.employee === employee) {
        user.time[timeType] += this.increment;
      }
    }
    this.calculateDayTimeInfo();
  }

  subHours(employee: string, timeType: string): void {
    for (const user of this.users) {
      if (user.employee === employee) {
        user.time[timeType] -= this.increment;
      }
    }
    this.calculateDayTimeInfo();
  }

  reset(): void {
    this.users = [];
    if (sessionStorage.loggedIn == 'true') {
      const user = JSON.parse(sessionStorage.user);
      this.users.push(user);
      this.calculateDayTimeInfo();
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

  switchView() {
    this.showingDays = !this.showingDays;
    this.increment = this.showingDays ? 4 : 1;
  }

  save(user: User): void {
    this.connector.updateUserTime(user).subscribe(data => {
      alert('Time information updated successfully.');
      sessionStorage.user = JSON.stringify(data);
      this.reset();
    }, error => {
      alert('Error updating your time info!');
      console.error(error);
    });
  }

  changePassword(): void {
    alert('Not currently supported.');
  }

  setDisplayName(): void {
    alert('Not currently supported.');
  }

  logout(): void {
    this.users = [];
    this.returnToLogin();
  }
}
