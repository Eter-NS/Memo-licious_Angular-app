import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { EMPTY, catchError } from 'rxjs';
import { NotesService } from 'src/app/app-view/data-access/notes/notes.service';
import { NoteGroupModel } from 'src/app/auth/services/Models/UserDataModels';

export const groupNotesResolver: ResolveFn<NoteGroupModel[] | null> = () => {
  const router = inject(Router);
  const notesService = inject(NotesService);
  return notesService.notes$.pipe(
    catchError(() => {
      router.navigateByUrl('/app/notes');
      return EMPTY;
    })
  );
};
