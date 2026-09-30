import { provideHttpClient, withFetch } from '@angular/common/http';
import {
	ApplicationConfig,
	provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
	provideRootTranslations,
	resolveInitialLanguage,
} from '@mfe/shared-util-i18n';
import { routes } from './market.routes';

/** Mirrors what the shell provides, so standalone mode behaves the same. */
export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideHttpClient(withFetch()),
		provideRootTranslations(
			(lang) => import(`../i18n/${lang}.json`),
			resolveInitialLanguage(),
		),
		provideRouter([
			{ path: '', pathMatch: 'full', redirectTo: 'market' },
			{ path: 'market', children: routes },
		]),
	],
};
