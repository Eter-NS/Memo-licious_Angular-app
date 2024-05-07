import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrinningFaceWithSweatEmojiComponent } from './grinning-face-with-sweat-emoji.component';

describe('GrinningFaceWithSweatEmojiComponent', () => {
  let component: GrinningFaceWithSweatEmojiComponent;
  let fixture: ComponentFixture<GrinningFaceWithSweatEmojiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GrinningFaceWithSweatEmojiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GrinningFaceWithSweatEmojiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
