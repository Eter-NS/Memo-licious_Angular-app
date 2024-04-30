import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FetchErrorComponent } from './fetch-error.component';
import { FetchErrorWrapperComponent } from './fetch-error-wrapper.mock.component';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { FetchErrorComponentHarness } from './fetch-error.component.harness';

describe('FetchErrorComponent', () => {
  let component: FetchErrorComponent;
  let loader: HarnessLoader;
  let fixture: ComponentFixture<FetchErrorComponent>;
  let mockFixture: ComponentFixture<FetchErrorWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FetchErrorWrapperComponent, FetchErrorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FetchErrorComponent);
    mockFixture = TestBed.createComponent(FetchErrorWrapperComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(mockFixture);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
