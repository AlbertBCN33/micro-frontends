import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PageTitle } from '@mfe/shared-ui';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
	selector: 'shell-documentation-page',
	imports: [
		RouterLink,
		RouterLinkActive,
		RouterOutlet,
		PageTitle,
		TranslatePipe,
	],
	template: `
		<ui-page-title
			[heading]="'HEADER.DOCUMENTATION' | translate"
			[subtitle]="'DOCS.SUBTITLE' | translate"
		/>
		<nav class="tabs" [attr.aria-label]="'DOCS.NAV_LABEL' | translate">
			<a
				routerLink="system-design"
				routerLinkActive="is-active"
				ariaCurrentWhenActive="page"
			>
				{{ 'DOCS.SYSTEM_DESIGN.TITLE' | translate }}
			</a>
			<a
				routerLink="architecture-diagram"
				routerLinkActive="is-active"
				ariaCurrentWhenActive="page"
			>
				{{ 'DOCS.DIAGRAM.TITLE' | translate }}
			</a>
		</nav>
		<router-outlet />
	`,
	styleUrl: './documentation-page.sass',
})
export class DocumentationPage {}
