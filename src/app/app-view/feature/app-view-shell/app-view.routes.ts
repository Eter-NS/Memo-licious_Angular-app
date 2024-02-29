import { Routes } from '@angular/router';
import { AppViewComponent } from '../app-view.page.component';
import {
  redirectUnauthorizedToGettingStartedChoosePath,
  redirectUnverifiedToVerifyEmail,
} from '../../../app.routes';
import { redirectNotFoundNoteListToGuard } from '../../utils/guards/redirect-not-found-note-list-to/redirect-not-found-note-list-to.guard';
import { NotesService } from '../../data-access/notes/notes.service';
import { NoteRestService } from '../../data-access/note-rest/note-rest.service';
import { groupNotesResolver } from '../../utils/resolvers/groupNotes/group-notes.resolver';

const redirectNotFoundNoteListToAppNotes = redirectNotFoundNoteListToGuard([
  '/app/notes',
]);

export const appViewRoutes: Routes = [
  {
    title: 'App',
    path: 'app',
    component: AppViewComponent,
    providers: [NotesService, NoteRestService],
    canActivate: [
      redirectUnauthorizedToGettingStartedChoosePath,
      redirectUnverifiedToVerifyEmail,
    ],
    children: [
      {
        path: 'notes',
        children: [
          {
            path: ':groupDetails',
            loadComponent: () =>
              import('../app-group-details/app-group-details.component').then(
                (m) => m.AppGroupDetailsComponent
              ),
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
        path: 'recycle-bin',
        loadComponent: () =>
          import('../app-recycle-bin/app-recycle-bin.component').then(
            (m) => m.AppRecycleBinComponent
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('../app-settings/app-settings.component').then(
            (m) => m.AppSettingsComponent
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
