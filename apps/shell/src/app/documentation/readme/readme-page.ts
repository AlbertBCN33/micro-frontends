import { Component, computed, inject, ViewEncapsulation } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import readme from '../../../../../../README.md';
import { renderReadme } from './readme-markdown';

/**
 * The project README, rendered in the app. It is imported at build time, so
 * it always matches the deployed version, and this route is lazy, so the
 * README and the Markdown renderer only load when the tab is opened.
 */
@Component({
	selector: 'shell-readme-page',
	imports: [TranslatePipe],
	templateUrl: './readme-page.html',
	styleUrl: './readme-page.sass',
	// The rendered HTML is not part of this component's template, so scoped
	// (emulated) styles would not reach it; styles are namespaced by .readme.
	encapsulation: ViewEncapsulation.None,
})
export class ReadmePage {
	readonly #translate = inject(TranslateService);

	protected readonly html = renderReadme(readme);
	protected readonly isTranslatedUi = computed(
		() => this.#translate.currentLang() !== 'en',
	);
}
