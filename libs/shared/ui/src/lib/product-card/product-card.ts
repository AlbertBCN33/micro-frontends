import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Presentational product tile used by the market grid and the wishlist.
 * The whole card is not a link: the title is the link, and actions such as
 * "Save" or "Remove" are projected as siblings. This avoids nested interactive
 * elements, which screen readers handle badly.
 */
@Component({
	selector: 'ui-product-card',
	imports: [RouterLink],
	template: `
		<article class="card">
			<img
				class="image"
				[src]="imageUrl()"
				alt=""
				width="320"
				height="200"
				loading="lazy"
				decoding="async"
			/>
			<div class="body">
				<h2 class="name">
					<a [routerLink]="link()">{{ name() }}</a>
				</h2>
				@if (meta(); as meta) {
					<p class="meta">{{ meta }}</p>
				}
				<p class="price">{{ price() }}</p>
				<div class="actions"><ng-content /></div>
			</div>
		</article>
	`,
	styleUrl: './product-card.sass',
})
export class ProductCard {
	readonly name = input.required<string>();
	/** Pre-formatted, localized price. */
	readonly price = input.required<string>();
	readonly imageUrl = input.required<string>();
	readonly link = input.required<string | readonly unknown[]>();
	readonly meta = input<string>();
}
