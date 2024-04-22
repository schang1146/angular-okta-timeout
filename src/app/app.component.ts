import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { OKTA_AUTH, OktaAuthStateService } from '@okta/okta-angular';
import {
  AccessToken,
  IDToken,
  OktaAuth,
  RefreshToken,
} from '@okta/okta-auth-js';
import { InactiveDialogComponent } from './component/inactive-dialog/inactive-dialog.component';
import { debounceTime, fromEvent, merge } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isAuthenticated?: boolean;
  accessToken?: AccessToken;
  idToken?: IDToken;
  refreshToken?: RefreshToken;
  error?: Error;

  validUserEvents = [{ scope: document, action: 'click' }];
  timeLastUserInteraction = new Date().getTime();

  timeBetweenChecks = 1000;
  timeToInactive = 15000;
  timeToSignOut = 30000;

  constructor(
    @Inject(OKTA_AUTH) private oktaAuth: OktaAuth,
    private oktaAuthStateService: OktaAuthStateService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.oktaAuthStateService.authState$.subscribe((authState) => {
      this.isAuthenticated = authState.isAuthenticated;
      this.accessToken = authState.accessToken;
      this.idToken = authState.idToken;
      this.refreshToken = authState.refreshToken;
      this.error = authState.error;
    });

    merge(...this.validUserEvents.map((ev) => fromEvent(ev.scope, ev.action)))
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.timeLastUserInteraction = new Date().getTime();
      });
  }

  convertUnixToDate(unix: number): Date {
    return new Date(unix);
  }

  logout() {
    this.oktaAuth.signOut();
  }

  openInactiveModal() {
    this.dialog.open(InactiveDialogComponent);
  }
}
