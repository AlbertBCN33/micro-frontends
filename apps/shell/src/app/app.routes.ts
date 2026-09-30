import { Route } from '@angular/router';
import { NxWelcomeComponent } from './nx-welcome.component';

export const appRoutes: Route[] = [
	{
		path: 'remote2',
		loadChildren: () =>
			import('remote2/Routes').then(
				(m) => m.remoteRoutes || console.error('Error loading remote2')
			),
	},
	{
		path: 'remote1',
		loadChildren: () =>
			import('remote1/Routes').then(
				(m) => m.remoteRoutes || console.error('Error loading remote1')
			),
	},
	{
		path: 'documentation',
		loadChildren: () =>
			import('./modules/documentation/documentation.routes').then(
				(m) => m.routes
			),
	},
	{
		path: '',
		component: NxWelcomeComponent,
	},
];
