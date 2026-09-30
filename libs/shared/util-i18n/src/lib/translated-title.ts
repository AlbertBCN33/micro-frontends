import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';

export const APP_TITLE_SUFFIX = 'MFE Store';

/**
 * Route `title` resolver that translates a key. It runs in the route's
 * injector, so a remote's key resolves through that remote's scoped
 * TranslateService.
 */
export function translatedTitle(key: string): ResolveFn<string> {
	return () =>
		inject(TranslateService)
			.get(key)
			.pipe(map((title: string) => `${title} · ${APP_TITLE_SUFFIX}`));
}
