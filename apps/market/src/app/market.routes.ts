import { Routes } from '@angular/router';
import {
	provideScopedTranslations,
	translatedTitle,
} from '@mfe/shared-util-i18n';
import { CatalogPage } from './catalog/catalog-page';
import { ProductCatalog } from './data/product-catalog';
import { ProductDetailPage } from './product-detail/product-detail-page';

/**
 * The market's public surface, exposed to the shell as `market/routes`.
 *
 * Host contract (what the market expects from whoever mounts it):
 * - a root TranslateService (the market adds a child scope on top);
 * - HttpClient;
 * - a path to mount under, which the market never hardcodes (all links are
 *   relative).
 */
export const routes: Routes = [
	{
		path: '',
		providers: [
			ProductCatalog,
			provideScopedTranslations(
				(lang) => import(`../assets/i18n/${lang}.json`),
			),
		],
		children: [
			{
				path: '',
				component: CatalogPage,
				title: translatedTitle('MARKET.TITLE'),
			},
			{
				path: ':id',
				component: ProductDetailPage,
				title: translatedTitle('MARKET.TITLE'),
			},
		],
	},
];
