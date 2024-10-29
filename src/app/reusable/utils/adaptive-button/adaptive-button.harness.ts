import {
  BaseHarnessFilters,
  ComponentHarness,
  EventData,
  HarnessPredicate,
} from '@angular/cdk/testing';

export interface AdaptiveButtonHarnessFilters extends BaseHarnessFilters {
  text?: string | RegExp;
}

export class AdaptiveButtonHarness extends ComponentHarness {
  static hostSelector = 'button[appAdaptiveButton], a[appAdaptiveButton]';

  static with(
    options: AdaptiveButtonHarnessFilters = {}
  ): HarnessPredicate<AdaptiveButtonHarness> {
    return new HarnessPredicate(AdaptiveButtonHarness, options).addOption(
      'text',
      options.text,
      (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text)
    );
  }

  async getText(): Promise<string> {
    return (await this.host()).text();
  }

  async isDisabled(): Promise<boolean> {
    const disabled = await (await this.host()).getAttribute('disabled');
    return disabled !== null;
  }

  async click(data?: Record<string, EventData>): Promise<void> {
    const host = await this.host();
    await host.dispatchEvent('click', data);
  }
}
