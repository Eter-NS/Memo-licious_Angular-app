import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingOneComponent } from './shopping-one.component';

describe('ShoppingOneComponent', () => {
  let component: ShoppingOneComponent;
  let fixture: ComponentFixture<ShoppingOneComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ShoppingOneComponent]
    });
    fixture = TestBed.createComponent(ShoppingOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
