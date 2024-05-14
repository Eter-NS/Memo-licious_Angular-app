import { Routes } from '@angular/router';
import {
  redirectUnauthorizedToGettingStartedChoosePath,
  redirectUnverifiedToVerifyEmail,
} from '../../../app.routes';
import { redirectNotFoundNoteListToGuard } from '../../utils/guards/redirect-not-found-note-list-to/redirect-not-found-note-list-to.guard';
import { NotesService } from '../../data-access/notes/notes.service';
import { NoteRestService } from '../../data-access/note-REST/note-rest.service';
import { groupNotesResolver } from '../../utils/resolvers/groupNotes/group-notes.resolver';

const redirectNotFoundNoteListToAppNotes = redirectNotFoundNoteListToGuard([
  '/app/notes',
]);

export const appViewRoutes: Routes = [
  {
    title: 'App',
    path: '',
    loadComponent: () =>
      import('../app-view.page.component').then((m) => m.AppViewComponent),
    providers: [NotesService, NoteRestService],
    canActivate: [
      redirectUnauthorizedToGettingStartedChoosePath,
      redirectUnverifiedToVerifyEmail,
    ],
    children: [
      {
        title: 'Notes',
        path: 'notes',
        children: [
          {
            path: ':groupDetails',
            loadComponent: () =>
              import(
                '../app-group-mobile-details/app-group-mobile-details.component'
              ).then((m) => m.GroupMobileDetailsComponent),
            canActivate: [redirectNotFoundNoteListToAppNotes],
            resolve: {
              groupNotes: groupNotesResolver,
            },
          },
          {
            path: '',
            loadComponent: () =>
              import('../app-view-list/app-view-list.component').then(
                (m) => m.AppViewListComponent
              ),
          },
        ],
      },
      {
        title: 'Recycle-bin',
        path: 'recycle-bin',
        loadComponent: () =>
          import('../app-recycle-bin/app-recycle-bin.page.component').then(
            (m) => m.AppRecycleBinComponent
          ),
      },
      {
        title: 'Settings',
        path: 'settings',
        loadComponent: () =>
          import('../app-settings/app-settings.component').then(
            (m) => m.AppSettingsComponent
          ),
      },
      {
        title: 'Settings - account',
        path: 'account',
        loadComponent: () =>
          import('../account-settings/account-settings.component').then(
            (m) => m.AccountSettingsComponent
          ),
      },

      {
        path: '**',
        redirectTo: 'notes',
        pathMatch: 'full',
      },
    ],
  },
];
