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
import {
  Subject,
  fromEvent,
  interval,
  merge,
  take,
  takeUntil,
  throttleTime,
} from 'rxjs';

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

  timeBetweenChecks = 2000; // ms
  inactiveThreshold = 300000; // ms
  signOutThreshold = 600000; // ms

  validUserEvents = [{ scope: document, action: 'click' }];
  stopListeningToUserInteractions$: Subject<null> = new Subject();
  userInteractions$ = merge(
    ...this.validUserEvents.map((ev) => fromEvent(ev.scope, ev.action))
  ).pipe(
    throttleTime(this.timeBetweenChecks / 2),
    takeUntil(this.stopListeningToUserInteractions$)
  );
  timeLastUserInteraction = new Date().getTime();

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

    interval(this.timeBetweenChecks).subscribe(() => {
      const currentTime = new Date().getTime();
      if (
        this.dialog.openDialogs.length === 0 &&
        currentTime - this.timeLastUserInteraction > this.inactiveThreshold
      ) {
        this.openInactiveModal();
      }
      if (currentTime - this.timeLastUserInteraction > this.signOutThreshold) {
        this.logout();
      }
    });

    this.addListenersOnUserInteractions();
  }

  convertUnixToDate(unix: number): Date {
    return new Date(unix);
  }

  addListenersOnUserInteractions(): void {
    this.userInteractions$.subscribe(() => {
      this.timeLastUserInteraction = new Date().getTime();
    });
  }

  removeListenersOnUserInteractions(): void {
    this.stopListeningToUserInteractions$.next(null);
  }

  logout() {
    this.oktaAuth.signOut();
  }

  openInactiveModal() {
    this.removeListenersOnUserInteractions();

    this.dialog.open(InactiveDialogComponent, {
      data: {
        timeToSignOut: this.timeLastUserInteraction + this.signOutThreshold,
      },
    });

    this.dialog.afterAllClosed.pipe(take(1)).subscribe(() => {
      this.timeLastUserInteraction = new Date().getTime();
      this.addListenersOnUserInteractions();
    });
  }
}
