import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DEFAULT_LANGUAGE } from './languages';

const formatters = new Map<string, Intl.NumberFormat>();

function formatterFor(locale: string, currency: string): Intl.NumberFormat {
	const key = `${locale}|${currency}`;
	let formatter = formatters.get(key);
	if (!formatter) {
		formatter = new Intl.NumberFormat(locale, {
			style: 'currency',
			currency,
		});
		formatters.set(key, formatter);
	}
	return formatter;
}

/**
 * Formats a price in the active UI language. It uses Intl directly rather than
 * CurrencyPipe, so no app has to register Angular locale data per language.
 *
 * Not pure, because the output depends on the language signal. Formatters are
 * cached, so re-running it is cheap.
 */
@Pipe({ name: 'localizedCurrency', pure: false })
export class LocalizedCurrencyPipe implements PipeTransform {
	readonly #translate = inject(TranslateService);

	transform(amount: number, currency: string): string {
		const locale = this.#translate.currentLang() ?? DEFAULT_LANGUAGE;
		return formatterFor(locale, currency).format(amount);
	}
}
