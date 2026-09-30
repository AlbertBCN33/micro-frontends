import { Route } from '@angular/router';
import { translatedTitle } from '@mfe/shared-util-i18n';
import { loadRemoteRoutes } from './federation/load-remote-routes';
import { HomePage } from './pages/home/home-page';
import { NotFoundPage } from './pages/not-found/not-found-page';

export const appRoutes: Route[] = [
	{ path: '', component: HomePage, title: translatedTitle('HOME.TITLE') },
	// Remotes: nothing is downloaded until one of these paths is visited.
	{ path: 'market', loadChildren: loadRemoteRoutes('market') },
	{ path: 'wishlist', loadChildren: loadRemoteRoutes('wishlist') },
	{
		path: 'documentation',
		loadChildren: () =>
			import('./documentation/documentation.routes').then(
				(m) => m.routes,
			),
	},
	{
		path: '**',
		component: NotFoundPage,
		title: translatedTitle('NOT_FOUND.TITLE'),
	},
];
