import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
	DEFAULT_LANGUAGE,
	isSupportedLanguage,
	Language,
	SUPPORTED_LANGUAGES,
} from './languages';

const STORAGE_KEY = 'mfe.language';

/**
 * Picks the first-render language from the saved choice, then the browser
 * locale. Runs before bootstrap, so it cannot use DI.
 */
export function resolveInitialLanguage(
	storage: Pick<Storage, 'getItem'> | undefined = globalThis.localStorage,
	browserLanguages: readonly string[] = globalThis.navigator?.languages ?? [],
): Language {
	const saved = safeRead(storage);
	if (isSupportedLanguage(saved)) return saved;

	const fromBrowser = browserLanguages
		.map((tag) => tag.slice(0, 2).toLowerCase())
		.find(isSupportedLanguage);
	return fromBrowser ?? DEFAULT_LANGUAGE;
}

/**
 * Single place that changes the page language. It keeps ngx-translate, the
 * saved preference and `<html lang>` in sync, so screen readers switch
 * pronunciation together with the text.
 */
@Injectable({ providedIn: 'root' })
export class LanguagePreference {
	readonly #translate = inject(TranslateService);
	readonly #document = inject(DOCUMENT);

	readonly supported = SUPPORTED_LANGUAGES;
	readonly current = this.#translate.currentLang;

	constructor() {
		effect(() => {
			const lang = this.current();
			if (lang) this.#document.documentElement.lang = lang;
		});
	}

	use(lang: Language): void {
		this.#translate.use(lang);
		try {
			localStorage.setItem(STORAGE_KEY, lang);
		} catch {
			// Storage can be unavailable (private mode, blocked cookies); the
			// choice still applies for this session.
		}
	}
}

function safeRead(storage: Pick<Storage, 'getItem'> | undefined) {
	try {
		return storage?.getItem(STORAGE_KEY) ?? null;
	} catch {
		return null;
	}
}
