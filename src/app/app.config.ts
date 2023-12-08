import {
  ApplicationConfig,
  importProvidersFrom,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { appRoutes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { environment } from 'src/environments/environment.dev';
import { appViewRoutes } from './app-view/app-view.routes';
import { gettingStartedRoutes } from './getting-started/getting-started.routes';

const routes = [/* ...appViewRoutes, */ ...gettingStartedRoutes, ...appRoutes];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
    importProvidersFrom(
      provideFirebaseApp(() => initializeApp(environment.firebase))
    ),
    importProvidersFrom(provideAuth(() => getAuth())),
    importProvidersFrom(provideDatabase(() => getDatabase())),
    // importProvidersFrom(
    //   provideAuth(() => {
    //     const auth = getAuth();
    //     if (!environment.production)
    //       connectAuthEmulator(auth, 'http://localhost:9099', {
    //         disableWarnings: true,
    //       });
    //     return auth;
    //   })
    // ),
    // importProvidersFrom(
    //   provideDatabase(() => {
    //     const database = getDatabase();
    //     if (!environment.production)
    //       connectDatabaseEmulator(database, 'localhost', 9000);
    //     return database;
    //   })
    // ),
  ],
};
