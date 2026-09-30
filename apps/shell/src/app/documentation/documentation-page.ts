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
	templateUrl: './documentation-page.html',
	styleUrl: './documentation-page.sass',
})
export class DocumentationPage {}
