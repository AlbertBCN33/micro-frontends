import { Routes } from '@angular/router';
import {
	provideScopedTranslations,
	translatedTitle,
} from '@mfe/shared-util-i18n';
import { WishlistPage } from './wishlist-page/wishlist-page';

/**
 * The wishlist's public surface, exposed to the shell as `wishlist/routes`.
 * Host contract: a root TranslateService. State comes from the shared
 * WishlistStore, never from the market.
 */
export const routes: Routes = [
	{
		path: '',
		providers: [
			provideScopedTranslations(
				(lang) => import(`../assets/i18n/${lang}.json`),
			),
		],
		children: [
			{
				path: '',
				component: WishlistPage,
				title: translatedTitle('WISHLIST.TITLE'),
			},
		],
	},
];
