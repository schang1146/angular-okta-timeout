import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OktaAuthModule } from '@okta/okta-angular';
import OktaAuth from '@okta/okta-auth-js';

import { environment } from 'src/environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InactiveDialogComponent } from './component/inactive-dialog/inactive-dialog.component';
import { HomeModule } from './pages/home/home.module';

const oktaAuth = new OktaAuth({
  issuer: environment.oktaIssuer,
  clientId: environment.oktaClientId,
  redirectUri: `${window.location.origin}/callback`,
  devMode: !environment.production,
  pkce: true,
});

@NgModule({
  declarations: [AppComponent, InactiveDialogComponent],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    OktaAuthModule.forRoot({ oktaAuth }),

    MatButtonModule,
    MatDialogModule,

    HomeModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
