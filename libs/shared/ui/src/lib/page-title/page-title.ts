import { Component, input } from '@angular/core';

/**
 * Page heading. There is exactly one `<h1>` per route, and this is it.
 * It takes already-translated text, so the UI library has no i18n dependency.
 */
@Component({
	selector: 'ui-page-title',
	template: `
		<h1 class="title">{{ heading() }}</h1>
		@if (subtitle(); as subtitle) {
			<p class="subtitle">{{ subtitle }}</p>
		}
	`,
	styleUrl: './page-title.sass',
})
export class PageTitle {
	readonly heading = input.required<string>();
	readonly subtitle = input<string>();
}
