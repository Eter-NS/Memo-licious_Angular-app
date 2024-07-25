import { Injectable, inject } from '@angular/core';
import {
  ref,
  set,
  get,
  listVal,
  update,
  Database,
} from '@angular/fire/database';

@Injectable({
  providedIn: 'root',
})
export class FirebaseDatabaseControllerService {
  db = inject(Database);

  ref = ref;
  set = set;
  get = get;
  listVal = listVal;
  update = update;
}
