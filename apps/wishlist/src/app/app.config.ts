import {
	ApplicationConfig,
	provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
	provideRootTranslations,
	resolveInitialLanguage,
} from '@mfe/shared-util-i18n';
import { routes } from './wishlist.routes';

/** Mirrors what the shell provides, so standalone mode behaves the same. */
export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideRootTranslations(
			(lang) => import(`../assets/i18n/${lang}.json`),
			resolveInitialLanguage(),
		),
		provideRouter([
			{ path: '', pathMatch: 'full', redirectTo: 'wishlist' },
			{ path: 'wishlist', children: routes },
		]),
	],
};
