import { TestBed } from '@angular/core/testing';
import { PageTitle } from './page-title';

describe('PageTitle', () => {
	it('renders a single h1 and an optional subtitle', () => {
		const fixture = TestBed.createComponent(PageTitle);
		fixture.componentRef.setInput('heading', 'Market');
		fixture.detectChanges();
		const el: HTMLElement = fixture.nativeElement;

		expect(el.querySelectorAll('h1')).toHaveLength(1);
		expect(el.querySelector('h1')?.textContent).toBe('Market');
		expect(el.querySelector('p')).toBeNull();

		fixture.componentRef.setInput('subtitle', 'Browse the catalog');
		fixture.detectChanges();
		expect(el.querySelector('p')?.textContent).toBe('Browse the catalog');
	});
});
