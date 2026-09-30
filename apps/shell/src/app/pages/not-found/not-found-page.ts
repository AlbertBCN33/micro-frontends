import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageTitle, StateMessage } from '@mfe/shared-ui';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
	selector: 'shell-not-found-page',
	imports: [RouterLink, PageTitle, StateMessage, TranslatePipe],
	template: `
		<ui-page-title [heading]="'NOT_FOUND.TITLE' | translate" />
		<ui-state-message [message]="'NOT_FOUND.BODY' | translate">
			<a class="mfe-button" routerLink="/">{{
				'NOT_FOUND.CTA' | translate
			}}</a>
		</ui-state-message>
	`,
})
export class NotFoundPage {}
