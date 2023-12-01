import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingTwoComponent } from './shopping-two.component';

describe('ShoppingTwoComponent', () => {
  let component: ShoppingTwoComponent;
  let fixture: ComponentFixture<ShoppingTwoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ShoppingTwoComponent]
    });
    fixture = TestBed.createComponent(ShoppingTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
