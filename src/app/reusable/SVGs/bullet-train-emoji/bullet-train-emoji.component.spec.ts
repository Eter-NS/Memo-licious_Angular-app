import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulletTrainEmojiComponent } from './bullet-train-emoji.component';

describe('BulletTrainEmojiComponent', () => {
  let component: BulletTrainEmojiComponent;
  let fixture: ComponentFixture<BulletTrainEmojiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BulletTrainEmojiComponent]
    });
    fixture = TestBed.createComponent(BulletTrainEmojiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
