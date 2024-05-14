import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmilingFaceEmojiComponent } from './smiling-face-emoji.component';

describe('SmilingFaceEmojiComponent', () => {
  let component: SmilingFaceEmojiComponent;
  let fixture: ComponentFixture<SmilingFaceEmojiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmilingFaceEmojiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SmilingFaceEmojiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
