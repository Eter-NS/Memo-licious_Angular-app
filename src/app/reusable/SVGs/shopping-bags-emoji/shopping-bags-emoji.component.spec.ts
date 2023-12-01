import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingBagsEmojiComponent } from './shopping-bags-emoji.component';

describe('ShoppingBagsEmojiComponent', () => {
  let component: ShoppingBagsEmojiComponent;
  let fixture: ComponentFixture<ShoppingBagsEmojiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ShoppingBagsEmojiComponent]
    });
    fixture = TestBed.createComponent(ShoppingBagsEmojiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
