import { EventEmitter, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  addAnimations,
  removeAnimations,
} from 'src/app/reusable/animations/animation-tools';
import { runWithDelay } from 'src/app/reusable/animations/animation-triggers';

export type AuthUserData = {
  name?: string;
  email: string;
  password: string;
};

@Injectable({
  providedIn: 'root',
})
export class FormCommonFeaturesService {
  addAnimations = addAnimations;
  runWithDelay = runWithDelay;
  removeAnimations = removeAnimations;

  onInitAnimations() {
    const h1Element = document.querySelector('h1');
    const formInputs: Array<HTMLElement> = [];
    document
      .querySelectorAll<HTMLElement>('.form-element')
      .forEach((el) => formInputs.push(el));
    const submitButton =
      document.querySelector<HTMLButtonElement>('.submit-button');

    if (!h1Element || !formInputs.length || !submitButton) return;

    this.addAnimations(h1Element, 'fadeIn-from-top-animation');
    this.addAnimations(formInputs, 'fadeIn-from-left-animation');
    this.addAnimations(submitButton, 'fadeIn-from-right-animation');

    this.runWithDelay([h1Element, ...formInputs, submitButton], {
      delayT: 75,
    })
      .then(() => {
        this.removeAnimations(h1Element, ['fadeIn-from-top-animation']);
        this.removeAnimations(formInputs, ['fadeIn-from-left-animation']);
        this.removeAnimations(submitButton, ['fadeIn-from-right-animation']);
      })
      .catch((err: PromiseRejectedResult) => {
        console.error(err.reason);
      });
  }

  getError = (
    formElement: FormGroup,
    element: string | string[],
    validation: string
  ) => formElement.get(element)?.hasError(validation);

  onSubmit = <T extends FormGroup>(
    formElement: T,
    emitter: EventEmitter<AuthUserData>
  ) => {
    if (formElement.invalid) {
      formElement.setErrors({ checkInputs: true });
      return;
    }
    formElement.setErrors(null);
    emitter.emit({ ...formElement.value });
  };
}
