import { Component, computed, input } from '@angular/core';

export type StateMessageKind = 'empty' | 'error' | 'loading';

/**
 * Empty, error and loading states share one component, so every screen gets
 * the same live-region semantics:
 * - errors use role="alert" (announced immediately);
 * - empty and loading states use role="status" (announced politely).
 * Actions such as "Retry" or "Browse the market" are projected in.
 */
@Component({
	selector: 'ui-state-message',
	templateUrl: './state-message.html',
	styleUrl: './state-message.sass',
})
export class StateMessage {
	readonly kind = input<StateMessageKind>('empty');
	readonly message = input.required<string>();
	protected readonly role = computed(() =>
		this.kind() === 'error' ? 'alert' : 'status',
	);
}
