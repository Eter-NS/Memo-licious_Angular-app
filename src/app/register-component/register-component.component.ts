import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  checkEmail,
  checkName,
  checkRetypedPassport,
} from './register-custom-validations/register-custom-validations';
import { GoogleLogoComponent } from '../../reusable/SVGs/google-logo/google-logo.component';
import { runWithDelay } from '../animations/animation-triggers';
import {
  addAnimations,
  removeAnimations,
  startAnimation,
} from '../animations/animation-tools';
import { RouterLink } from '@angular/router';
import { CustomMatRippleDirective } from 'src/reusable/ripples/ripple-color-checker.directive';

@Component({
  standalone: true,
  templateUrl: './register-component.component.html',
  styleUrls: ['./register-component.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GoogleLogoComponent,
    RouterLink,
    CustomMatRippleDirective,
  ],
})
export class RegisterComponentComponent
  implements AfterViewInit, AfterViewChecked
{
  @ViewChild('googleButton') googleButton!: ElementRef<HTMLSpanElement>;
  svgHeight = '25';
  svgWidth = '25';

  passportPattern =
    /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,20}$/;

  registerForm = new FormGroup(
    {
      name: new FormControl('', {
        validators: [Validators.required, checkName],
      }),
      email: new FormControl('', {
        validators: [Validators.required, checkEmail],
      }),
      password: new FormControl('', {
        validators: [
          Validators.required,
          Validators.pattern(this.passportPattern),
        ],
      }),
      retypedPassword: new FormControl('', {
        validators: [Validators.required],
      }),
    },
    {
      validators: [checkRetypedPassport],
    }
  );

  private cd = inject(ChangeDetectorRef);

  ngAfterViewInit(): void {
    const h1Element = document.querySelector('h1') as HTMLHeadingElement;
    const formInputs = document.querySelectorAll(
      '.form-element'
    ) as NodeListOf<HTMLDivElement>;
    const submitButton = document.querySelector(
      '.submit-button'
    ) as HTMLElement;
    const bottomElements = [
      document.querySelector('.signin-with-google') as HTMLElement,
      document.querySelector('h2') as HTMLElement,
    ];

    addAnimations(h1Element, 'fadeIn-from-top-animation');
    addAnimations(formInputs, 'fadeIn-from-left-animation');
    addAnimations(submitButton, 'fadeIn-from-right-animation');
    addAnimations(bottomElements, 'fadeIn-from-bottom-animation');

    startAnimation(h1Element);
    runWithDelay(formInputs, { delay: 200 });
    startAnimation(submitButton);
    runWithDelay(bottomElements, { delay: 200 }).then(() => {
      removeAnimations(h1Element, ['fadeIn-from-top-animation']);
      removeAnimations(formInputs, ['fadeIn-from-left-animation']);
      removeAnimations(submitButton, ['fadeIn-from-right-animation']);
      removeAnimations(bottomElements, ['fadeIn-from-bottom-animation']);
    });
  }

  ngAfterViewChecked(): void {
    const fontSize =
      Number(
        window
          .getComputedStyle(this.googleButton.nativeElement)
          .fontSize.split('px')[0]
      ) + 0;

    this.svgHeight = `${fontSize}px`;
    this.svgWidth = `${fontSize}px`;
    this.cd.detectChanges();
  }

  getError(element: string, validation: string) {
    return this.registerForm.get(element)?.hasError(validation);
  }

  onSubmit() {
    this.registerForm;

    // Send the form to firebase auth
  }
}
