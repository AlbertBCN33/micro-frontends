import { Route } from '@angular/router';
import { translatedTitle } from '@mfe/shared-util-i18n';
import { ArchitectureDiagram } from './architecture-diagram/architecture-diagram';
import { DocumentationPage } from './documentation-page';
import { SystemDesign } from './system-design/system-design';

export const routes: Route[] = [
	{
		path: '',
		component: DocumentationPage,
		children: [
			{ path: '', redirectTo: 'system-design', pathMatch: 'full' },
			{
				path: 'system-design',
				component: SystemDesign,
				title: translatedTitle('DOCS.SYSTEM_DESIGN.TITLE'),
			},
			{
				path: 'architecture-diagram',
				component: ArchitectureDiagram,
				title: translatedTitle('DOCS.DIAGRAM.TITLE'),
			},
		],
	},
];
