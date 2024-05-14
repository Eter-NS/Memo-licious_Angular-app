import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartyingFaceEmojiComponent } from './partying-face-emoji.component';

describe('PartyingFaceEmojiComponent', () => {
  let component: PartyingFaceEmojiComponent;
  let fixture: ComponentFixture<PartyingFaceEmojiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartyingFaceEmojiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PartyingFaceEmojiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
