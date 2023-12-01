import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingThreeComponent } from './shopping-three.component';

describe('ShoppingThreeComponent', () => {
  let component: ShoppingThreeComponent;
  let fixture: ComponentFixture<ShoppingThreeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ShoppingThreeComponent]
    });
    fixture = TestBed.createComponent(ShoppingThreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
