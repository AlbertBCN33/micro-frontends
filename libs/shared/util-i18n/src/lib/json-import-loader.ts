import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { from, map, Observable } from 'rxjs';
import { Language } from './languages';

/**
 * Loads one language file of the *calling* app.
 *
 * It must be declared inside each app (not in this lib) so the bundler resolves
 * the relative path against that app's sources:
 *
 * ```ts
 * const importer: TranslationImporter = (lang) => import(`../assets/i18n/${lang}.json`);
 * ```
 *
 * The bundler then emits one content-hashed chunk per language, served from the
 * app's own origin. That is what lets a remote ship its translations
 * independently of the shell.
 */
export type TranslationImporter = (
	lang: Language,
) => Promise<{ default: TranslationObject }>;

export class JsonImportTranslateLoader implements TranslateLoader {
	constructor(private readonly importer: TranslationImporter) {}

	getTranslation(lang: string): Observable<TranslationObject> {
		return from(this.importer(lang as Language)).pipe(
			map((module) => module.default),
		);
	}
}
