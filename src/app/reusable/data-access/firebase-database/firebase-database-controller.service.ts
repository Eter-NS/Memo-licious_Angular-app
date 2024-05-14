import { Injectable } from '@angular/core';
import { ref, set, get, listVal, update } from '@angular/fire/database';

@Injectable({
  providedIn: 'root',
})
export class FirebaseDatabaseControllerService {
  ref = ref;
  set = set;
  get = get;
  listVal = listVal;
  update = update;
}
