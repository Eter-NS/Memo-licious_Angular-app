import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FetchErrorComponent } from './fetch-error.component';
import { FetchErrorWrapperComponent } from './fetch-error-wrapper.mock.component';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { FetchErrorHarness } from './fetch-error.harness';

describe('FetchErrorComponent', () => {
  let component: FetchErrorComponent;
  let loader: HarnessLoader;
  let fixture: ComponentFixture<FetchErrorComponent>;
  let mockFixture: ComponentFixture<FetchErrorWrapperComponent>;
  let harness: FetchErrorHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FetchErrorWrapperComponent, FetchErrorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FetchErrorComponent);
    mockFixture = TestBed.createComponent(FetchErrorWrapperComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(mockFixture);
    harness = await loader.getHarness(FetchErrorHarness);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(harness).toBeTruthy();
  });
});
