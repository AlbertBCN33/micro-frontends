import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageTitle, StateMessage } from '@mfe/shared-ui';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
	selector: 'shell-not-found-page',
	imports: [RouterLink, PageTitle, StateMessage, TranslatePipe],
	templateUrl: './not-found-page.html',
	styleUrl: './not-found-page.sass',
})
export class NotFoundPage {}
