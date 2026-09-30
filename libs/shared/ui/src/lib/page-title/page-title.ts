import { Component, input } from '@angular/core';

/**
 * Page heading. There is exactly one `<h1>` per route, and this is it.
 * It takes already-translated text, so the UI library has no i18n dependency.
 */
@Component({
	selector: 'ui-page-title',
	templateUrl: './page-title.html',
	styleUrl: './page-title.sass',
})
export class PageTitle {
	readonly heading = input.required<string>();
	readonly subtitle = input<string>();
}
