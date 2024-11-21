import { NxWelcomeComponent } from './nx-welcome.component';
import { Route } from '@angular/router';

export const appRoutes: Route[] = [
	{
		path: 'remote2',
		loadChildren: () =>
			import('remote2/Routes').then((m) => m!.remoteRoutes),
	},
	{
		path: 'remote1',
		loadChildren: () =>
			import('remote1/Routes').then((m) => m!.remoteRoutes),
	},
	{
		path: '',
		component: NxWelcomeComponent,
	},
];
