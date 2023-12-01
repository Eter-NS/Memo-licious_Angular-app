import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListIllustrationComponent } from './list-illustration.component';

describe('ListIllustrationComponent', () => {
  let component: ListIllustrationComponent;
  let fixture: ComponentFixture<ListIllustrationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ListIllustrationComponent]
    });
    fixture = TestBed.createComponent(ListIllustrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
