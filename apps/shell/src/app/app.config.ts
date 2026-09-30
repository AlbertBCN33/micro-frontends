import { provideHttpClient, withFetch } from '@angular/common/http';
import {
	ApplicationConfig,
	provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import {
	provideRootTranslations,
	resolveInitialLanguage,
} from '@mfe/shared-util-i18n';
import { appRoutes } from './app.routes';

/**
 * Everything here is part of the host contract that remotes rely on: the root
 * TranslateService, HttpClient and the router. Changing it is a cross-team
 * change, see docs/adr.
 */
export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideHttpClient(withFetch()),
		provideRootTranslations(
			(lang) => import(`../i18n/${lang}.json`),
			resolveInitialLanguage(),
		),
		provideRouter(
			appRoutes,
			withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
		),
	],
};
