import {Component, Inject, OnInit} from '@angular/core';
import {ConnectorService} from '../../services/connector.service';
import {ActivatedRoute, Router} from '@angular/router';
import {User} from '../../models/User';
import {MatTableDataSource} from '@angular/material/table';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import * as bcrypt from 'bcryptjs';

export interface DialogData {
  user: User
}

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

  users: User[] = [];
  showingDays: boolean = false;
  timeType: string = ' (hours)';
  displayedColumns: string[] = ['user', 'vacation', 'personal', 'floating', 'total', 'buttons'];
  dataSource: MatTableDataSource<User>;
  increment = 1;
  dayTimeInfo: number[] = [];

  constructor(private route: ActivatedRoute,
              private router: Router,
              private connector: ConnectorService,
              public dialog: MatDialog) { }

  ngOnInit(): void {
    this.reset(false);
  }

  /* Page Functions */
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
        user.time[timeType] < 0 ? user.time[timeType] = 0 : null;
      }
    }
    this.calculateDayTimeInfo();
  }
  subHours(employee: string, timeType: string): void {
    for (const user of this.users) {
      if (user.employee === employee) {
        user.time[timeType] -= this.increment;
        user.time[timeType] < 0 ? user.time[timeType] = 0 : null;
      }
    }
    this.calculateDayTimeInfo();
  }
  reset(shouldAlert: boolean): void {
    this.users = [];
    if (sessionStorage.loggedIn == 'true') {
      const user = JSON.parse(sessionStorage.user);
      this.users.push(user);
      this.calculateDayTimeInfo();
      this.dataSource = new MatTableDataSource<User>(this.users);
    } else {
      sessionStorage.notLoggedIn = true;
      this.returnToLogin();
    }
    //shouldAlert ? alert('Updated data') : null;
  }
  switchView() {
    this.showingDays = !this.showingDays;
    this.increment = this.showingDays ? 4 : 1;
    this.timeType = this.timeType === ' (hours)' ? ' (days)' : ' (hours)';
  }

  /* Redirect and Logout */
  returnToLogin(): void {
    sessionStorage.loggedIn = 'false';
    sessionStorage.user = null;
    window.location.href = '/';
    return;
  }
  logout(): void {
    this.users = [];
    this.returnToLogin();
  }

  /* Save User Time */
  save(user: User): void {
    this.connector.updateUserTime(user).subscribe(data => {
      alert('Time information updated successfully.');
      sessionStorage.user = JSON.stringify(data);
      this.reset(false);
    }, error => {
      alert('Error updating your time info!');
      console.error(error);
    });
  }
  modifyTimeDirectly(key: string): void {
    alert('Not currently supported.');
  }

  /* Change Display Name */
  setDisplayName(): void {
    this.openNameChangeDialog();
  }
  openNameChangeDialog(): void {
    const dialogRef = this.dialog.open(ChangeDisplayNameDialog, {
      width: '500px',
      data: {user: this.users[0] }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.handleNameChange(result);
      }
    });
  }
  handleNameChange(result: any): void {
    const newName = result.name;
    this.connector.changeDisplayName(this.users[0].username, newName).subscribe(data => {
      const user = JSON.parse(sessionStorage.user);
      user.employee = newName;
      sessionStorage.user = JSON.stringify(user);
      this.reset(false);
    }, error => {
      alert('Error updating display name!');
      console.error(error);
    });
  }

  /* Password Change */
  changePassword(): void {
    this.openPasswordDialog();
  }
  openPasswordDialog(): void {
    const dialogRef = this.dialog.open(ChangePassDialog, {
      width: '500px',
      data: {user: this.users[0] }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.handlePasswordChange(result);
      }
    });
  }
  handlePasswordChange(result: any): void {
    const current = result.current;
    const newPass = result.newPass;
    const newPass2 = result.newPass2;
    if (newPass === newPass2) {
      const salt = this.users[0].salt;
      const userPass = this.users[0].pass;
      const hash = bcrypt.hashSync(current, salt);
      if (hash === userPass) {
        this.updatePassword(newPass, salt);
      } else {
        alert('That\'s not your current password!');
      }
    } else {
      alert('Passwords do not match!');
    }
  }
  updatePassword(newPass: string, salt: string): void {
    const newHash = bcrypt.hashSync(newPass, salt);
    if (newHash === this.users[0].pass) {
      alert('Password updated successfully.');
      return;
    }
    this.users[0].pass = newHash;
    this.connector.changePassword(this.users[0]).subscribe(data => {
      alert('Password updated successfully.');
      const user = JSON.parse(sessionStorage.user);
      user.pass = newHash;
      sessionStorage.user = JSON.stringify(user);
      this.reset(false);
    }, error => {
      alert('Error updating password!');
      console.error(error);
    });
  }
}

@Component({ selector: 'app-user-list', templateUrl: './change-pass-dialog.html', styleUrls: ['./user-list.component.scss'] })
export class ChangePassDialog {
  newPassUser: any = {};
  constructor( public dialogRef: MatDialogRef<ChangePassDialog>, @Inject(MAT_DIALOG_DATA) public data: DialogData) {}
  onNoClick(): void { this.dialogRef.close(); }
}

@Component({ selector: 'app-user-list', templateUrl: './change-display-name.html', styleUrls: ['./user-list.component.scss'] })
export class ChangeDisplayNameDialog implements OnInit{
  newNameUser: any = {};
  constructor( public dialogRef: MatDialogRef<ChangePassDialog>, @Inject(MAT_DIALOG_DATA) public data: DialogData) {}
  ngOnInit(): void {
    const oldName = JSON.parse(sessionStorage.user).employee;
    this.newNameUser.name = oldName ? oldName : '';
  }
  onNoClick(): void { this.dialogRef.close(); }
}
