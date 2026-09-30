import { Route } from "@angular/router";
import { DocumentationComponent } from "./documentation.component";
import { SystemDesignComponent } from "./system-design/system-design.component";
import { ArchitectureDiagramComponent } from "./architecture-diagram/architecture-diagram.component";

export const routes: Route[] = [
	{
		path: '',
		component: DocumentationComponent,
		children: [
			{ path: '', redirectTo: 'system-design', pathMatch: 'full' },
			{
				path: 'system-design',
				component: SystemDesignComponent
			},
			{
				path: 'architecture-diagram',
				component: ArchitectureDiagramComponent
			}
		]
	},
];
