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
  onInitAnimations() {
    const h1Element = document.querySelector('h1');
    const formInputs: Array<HTMLElement> = [];
    document
      .querySelectorAll<HTMLElement>('.form-element')
      .forEach((el) => formInputs.push(el));
    const submitButton =
      document.querySelector<HTMLButtonElement>('.submit-button');

    if (!h1Element || !formInputs.length || !submitButton) return;

    addAnimations(h1Element, 'fadeIn-from-top-animation');
    addAnimations(formInputs, 'fadeIn-from-left-animation');
    addAnimations(submitButton, 'fadeIn-from-right-animation');

    runWithDelay([h1Element, ...formInputs, submitButton], {
      delayT: 75,
    }).then(() => {
      removeAnimations(h1Element, ['fadeIn-from-top-animation']);
      removeAnimations(formInputs, ['fadeIn-from-left-animation']);
      removeAnimations(submitButton, ['fadeIn-from-right-animation']);
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
