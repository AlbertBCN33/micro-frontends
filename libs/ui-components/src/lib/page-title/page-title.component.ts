import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'ui-page-title',
	standalone: true,
	imports: [CommonModule, TranslatePipe],
	providers: [TranslateService],
	templateUrl: './page-title.component.html',
	styleUrl: './page-title.component.sass',
})
export class PageTitleComponent {
	data = input.required<string>();
}
