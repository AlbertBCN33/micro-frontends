import { TestBed } from '@angular/core/testing';
import { StateMessage } from './state-message';

function render(kind: 'empty' | 'error' | 'loading') {
	const fixture = TestBed.createComponent(StateMessage);
	fixture.componentRef.setInput('kind', kind);
	fixture.componentRef.setInput('message', 'Something');
	fixture.detectChanges();
	return fixture.nativeElement as HTMLElement;
}

describe('StateMessage', () => {
	it('announces errors assertively', () => {
		expect(render('error').querySelector('[role="alert"]')).not.toBeNull();
	});

	it.each(['empty', 'loading'] as const)(
		'announces %s states politely',
		(kind) => {
			const el = render(kind);
			expect(el.querySelector('[role="status"]')?.textContent).toContain(
				'Something',
			);
		},
	);
});
