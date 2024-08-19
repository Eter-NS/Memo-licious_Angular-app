import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { redirectNotFoundNoteListToGuard } from './redirect-not-found-note-list-to.guard';
import { BehaviorSubject, Observable } from 'rxjs';
import { NoteGroupModel } from 'src/app/auth/utils/Models/UserDataModels.interface';
import { Provider } from '@angular/core';
import { NotesService } from 'src/app/app-view/data-access/notes/notes.service';

describe('redirectNotFoundNoteListToGuard', () => {
  // Mocks
  const notesSubject = new BehaviorSubject<NoteGroupModel[]>([]);
  const notesServiceMock = {
    notes$: notesSubject.asObservable(),
  };
  const routerMock = jasmine.createSpyObj<Router>(['createUrlTree']);

  const executeGuard = (denyFallback: string[]): CanActivateFn => {
    return TestBed.runInInjectionContext(() =>
      redirectNotFoundNoteListToGuard(denyFallback)
    );
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: NotesService, useValue: notesServiceMock },
      ] satisfies Provider[],
    });
  });

  it('should be created.', () => {
    expect(executeGuard).toBeTruthy();
  });

  it(`should return true if the url ends with an existing group id.`, fakeAsync(() => {
    // Arrange
    notesSubject.next([
      {
        id: 'xxx',
      } as NoteGroupModel,
    ]);

    // Act
    TestBed.runInInjectionContext(() => {
      let value: boolean | UrlTree | undefined;

      const guard = executeGuard(['/notes']);

      const subscription = (
        guard(
          {} as ActivatedRouteSnapshot,
          { url: '/notes/xxx' } as RouterStateSnapshot
        ) as Observable<true | UrlTree>
      ).subscribe((state) => {
        value = state;
      });

      tick();
      subscription.unsubscribe();

      // Assert
      expect(value).toBe(true);
    });
  }));

  it(`should return UrlTree if the url does NOT contain group id.`, fakeAsync(() => {
    // Arrange
    const spy = routerMock.createUrlTree.and.callFake(() => new UrlTree());
    notesSubject.next([
      {
        id: 'xxx2',
      } as NoteGroupModel,
    ]);

    // Act
    TestBed.runInInjectionContext(() => {
      let value: boolean | UrlTree | undefined;

      const guard = executeGuard(['/notes']);

      const subscription = (
        guard(
          {} as ActivatedRouteSnapshot,
          { url: '/notes/xxx' } as RouterStateSnapshot
        ) as Observable<true | UrlTree>
      ).subscribe((state) => {
        value = state;
      });

      tick();
      subscription.unsubscribe();

      // Assert
      expect(spy).toHaveBeenCalled();
      expect(value instanceof UrlTree).toBe(true);
    });
  }));

  it(`should return UrlTree if the url does NOT contain group id.`, fakeAsync(() => {
    // Arrange
    const spy = routerMock.createUrlTree.and.callFake(() => new UrlTree());
    notesSubject.error(new Error('Example error'));

    // Act
    TestBed.runInInjectionContext(() => {
      let value: boolean | UrlTree | undefined;

      const guard = executeGuard(['/notes']);

      const subscription = (
        guard(
          {} as ActivatedRouteSnapshot,
          { url: '/notes/xxx' } as RouterStateSnapshot
        ) as Observable<true | UrlTree>
      ).subscribe((state) => {
        value = state;
      });

      tick();
      subscription.unsubscribe();

      // Assert
      expect(spy).toHaveBeenCalled();
      expect(value instanceof UrlTree).toBe(true);
    });
  }));
});
