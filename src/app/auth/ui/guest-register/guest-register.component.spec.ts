import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestRegisterComponent } from './guest-register.component';

describe('GuestRegisterComponent', () => {
  let component: GuestRegisterComponent;
  let fixture: ComponentFixture<GuestRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuestRegisterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GuestRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('toggleAuthMethod()', () => {
    it('should not change existing controls when the formGroup was not found', () => {
      const formGroupSpy = spyOn(
        component.localRegisterForm,
        'get'
      ).and.returnValue(null);
      component.toggleAuthMethod();

      expect(formGroupSpy).toHaveBeenCalled();
      expect(
        component.localRegisterForm.controls.pinGroup.get('pin')?.disabled
      ).toBeFalse();
    });
  });

  describe('onSubmit()', () => {
    it('should call onFailure when name control is empty', () => {
      component.localRegisterForm.controls.name.setValue('');
      component.onSubmit();

      expect(component.localRegisterForm.errors).toEqual({
        invalidForm: true,
      });
    });

    it('should call onFailure when the pin group and password group are invalid', () => {
      component.localRegisterForm
        .get(['passwordGroup', 'password'])
        ?.setValue('');
      component.localRegisterForm.get(['pinGroup', 'pin'])?.setValue('');
      component.onSubmit();

      expect(component.localRegisterForm.errors).toEqual({
        invalidForm: true,
      });
    });

    it('should call onFailure when the pin group and password group are disabled (somehow)', () => {
      component.localRegisterForm.get(['passwordGroup', 'password'])?.disable();
      component.localRegisterForm.get(['pinGroup', 'pin'])?.disable();
      component.onSubmit();

      expect(component.localRegisterForm.errors).toEqual({
        invalidForm: true,
      });
    });
  });
});
