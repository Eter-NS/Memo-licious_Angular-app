import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService implements OnDestroy {
  private _error = new Subject<string>();

  get error$() {
    return this._error.asObservable();
  }

  onError(message: string) {
    this._error.next(message);
  }

  ngOnDestroy(): void {
    this._error.complete();
  }
}
