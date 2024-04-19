import { Component, Inject, OnInit } from '@angular/core';
import { OKTA_AUTH, OktaAuthStateService } from '@okta/okta-angular';
import {
  AccessToken,
  IDToken,
  OktaAuth,
  RefreshToken,
} from '@okta/okta-auth-js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isAuthenticated: boolean | undefined;
  accessToken: AccessToken | undefined;
  idToken: IDToken | undefined;
  refreshToken: RefreshToken | undefined;
  error: Error | undefined;

  constructor(
    @Inject(OKTA_AUTH) private oktaAuth: OktaAuth,
    private oktaAuthStateService: OktaAuthStateService
  ) {}

  ngOnInit(): void {
    this.oktaAuthStateService.authState$.subscribe((authState) => {
      this.isAuthenticated = authState.isAuthenticated;
      this.accessToken = authState.accessToken;
      this.idToken = authState.idToken;
      this.refreshToken = authState.refreshToken;
      this.error = authState.error;
    });
  }

  logout() {
    this.oktaAuth.signOut();
  }
}
