import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService implements OnDestroy {
  #error = new Subject<string>();

  get error$() {
    return this.#error.asObservable();
  }

  onError(message: string) {
    this.#error.next(message);
  }

  ngOnDestroy(): void {
    this.#error.complete();
  }
}
