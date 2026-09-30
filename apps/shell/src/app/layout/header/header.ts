import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { WishlistStore } from '@mfe/shared-data-access-wishlist';
import { isSupportedLanguage, LanguagePreference } from '@mfe/shared-util-i18n';
import { TranslatePipe } from '@ngx-translate/core';

interface NavItem {
	readonly path: string;
	readonly label: string;
	readonly exact: boolean;
}

@Component({
	selector: 'shell-header',
	imports: [RouterLink, RouterLinkActive, TranslatePipe],
	templateUrl: './header.html',
	styleUrl: './header.sass',
})
export class Header {
	protected readonly wishlist = inject(WishlistStore);
	protected readonly language = inject(LanguagePreference);

	protected readonly nav: readonly NavItem[] = [
		{ path: '/', label: 'HEADER.DASHBOARD', exact: true },
		{ path: '/market', label: 'HEADER.MARKET', exact: false },
		{ path: '/documentation', label: 'HEADER.DOCUMENTATION', exact: false },
	];

	protected onLanguageChange(event: Event): void {
		const value = (event.target as HTMLSelectElement).value;
		if (isSupportedLanguage(value)) this.language.use(value);
	}
}
