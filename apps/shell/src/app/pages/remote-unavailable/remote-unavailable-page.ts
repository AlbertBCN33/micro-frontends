import { DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PageTitle, StateMessage } from '@mfe/shared-ui';
import { TranslatePipe } from '@ngx-translate/core';
import { map } from 'rxjs';

/**
 * Rendered in place of a remote that failed to load. The shell, the navigation
 * and the other remotes keep working: failures stay contained.
 */
@Component({
	selector: 'shell-remote-unavailable-page',
	imports: [RouterLink, PageTitle, StateMessage, TranslatePipe],
	template: `
		<ui-page-title [heading]="'REMOTE_UNAVAILABLE.TITLE' | translate" />
		<ui-state-message
			kind="error"
			[message]="
				'REMOTE_UNAVAILABLE.BODY' | translate: { remote: remote() }
			"
		>
			<button type="button" class="mfe-button" (click)="retry()">
				{{ 'REMOTE_UNAVAILABLE.RETRY' | translate }}
			</button>
			<a routerLink="/">{{ 'NOT_FOUND.CTA' | translate }}</a>
		</ui-state-message>
	`,
})
export class RemoteUnavailablePage {
	readonly #document = inject(DOCUMENT);
	protected readonly remote = toSignal(
		inject(ActivatedRoute).data.pipe(map((data) => String(data['remote']))),
		{ initialValue: '' },
	);

	protected retry(): void {
		// The router caches the fallback routes for this path, so a full reload
		// is the reliable way to fetch the remote again.
		this.#document.location.reload();
	}
}
