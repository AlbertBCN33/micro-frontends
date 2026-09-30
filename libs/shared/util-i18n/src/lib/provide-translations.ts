import {
	EnvironmentProviders,
	inject,
	provideAppInitializer,
	Provider,
} from '@angular/core';
import {
	provideChildTranslateService,
	provideTranslateCompiler,
	provideTranslateLoader,
	provideTranslateService,
	TranslateService,
} from '@ngx-translate/core';
import { TranslateMessageFormatCompiler } from 'ngx-translate-messageformat-compiler';
import { firstValueFrom } from 'rxjs';
import {
	JsonImportTranslateLoader,
	TranslationImporter,
} from './json-import-loader';
import { DEFAULT_LANGUAGE, Language } from './languages';

/**
 * Messages use ICU MessageFormat (`{count, plural, one {…} other {…}}`), so
 * plurals and gender are grammatical in every language. The compiler is set on
 * each service because child services compile their own files.
 */

/**
 * Root translations: used by the shell, and by a remote when it runs standalone.
 * Owns the active language for the whole page.
 *
 * Bootstrap waits for the first language file, so the first paint never shows
 * raw keys. A failed load is tolerated: keys are a better failure mode than a
 * blank page.
 */
export function provideRootTranslations(
	importer: TranslationImporter,
	initialLanguage: Language = DEFAULT_LANGUAGE,
): (Provider | EnvironmentProviders)[] {
	return [
		...provideTranslateService({
			loader: provideTranslateLoader(
				() => new JsonImportTranslateLoader(importer),
			),
			compiler: provideTranslateCompiler(TranslateMessageFormatCompiler),
			fallbackLang: DEFAULT_LANGUAGE,
			lang: initialLanguage,
		}),
		provideAppInitializer(() =>
			firstValueFrom(inject(TranslateService).use(initialLanguage)).catch(
				(error: unknown) =>
					console.error(
						'[i18n] Initial translations failed to load',
						error,
					),
			),
		),
	];
}

/**
 * Scoped translations for a remote's route subtree.
 *
 * Creates a child TranslateService that loads the remote's own files, follows
 * the root language, and falls back to the root for keys it does not define.
 * The remote therefore never needs to ship its keys inside the shell's files.
 */
export function provideScopedTranslations(
	importer: TranslationImporter,
): Provider[] {
	return provideChildTranslateService({
		loader: provideTranslateLoader(
			() => new JsonImportTranslateLoader(importer),
		),
		compiler: provideTranslateCompiler(TranslateMessageFormatCompiler),
	});
}
