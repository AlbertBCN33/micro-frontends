import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
	selector: 'shell-system-design',
	imports: [TranslatePipe],
	templateUrl: './system-design.html',
	styleUrl: './system-design.sass',
})
export class SystemDesign {
	protected readonly sections = [
		'COMPOSITION',
		'LAZY_LOADING',
		'SHARED_STATE',
		'I18N',
		'RESILIENCE',
		'VERSIONING',
	] as const;
}
