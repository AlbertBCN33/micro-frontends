import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WishlistStore } from '@mfe/shared-data-access-wishlist';
import { PageTitle } from '@mfe/shared-ui';
import { LocalizedCurrencyPipe } from '@mfe/shared-util-i18n';
import { TranslatePipe } from '@ngx-translate/core';
import { RemoteLoader } from '../../federation/remote-loader';

@Component({
	selector: 'shell-home-page',
	imports: [RouterLink, PageTitle, TranslatePipe, LocalizedCurrencyPipe],
	templateUrl: './home-page.html',
	styleUrl: './home-page.sass',
})
export class HomePage {
	protected readonly wishlist = inject(WishlistStore);
	protected readonly remotes = inject(RemoteLoader);
}
