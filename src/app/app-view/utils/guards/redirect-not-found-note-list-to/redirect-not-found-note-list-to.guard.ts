import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { NotesService } from '../../../data-access/notes/notes.service';
import { map } from 'rxjs';

export const redirectNotFoundNoteListToGuard = (
  denyFallback: string[]
): CanActivateFn => {
  return (route, state) => {
    const notesService = inject(NotesService);
    const router = inject(Router);

    return notesService.notes$.pipe(
      map((groups) => {
        if (groups === null) {
          return router.createUrlTree(denyFallback);
        }

        const doesGroupExist = groups.some((group) =>
          state.url.endsWith(group.id)
        );

        return doesGroupExist ? true : router.createUrlTree(denyFallback);
      })
    );
  };
};
