import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppRecycleBinComponent } from './app-recycle-bin.page.component';

describe('AppRecycleBinComponent', () => {
  let component: AppRecycleBinComponent;
  let fixture: ComponentFixture<AppRecycleBinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppRecycleBinComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppRecycleBinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
