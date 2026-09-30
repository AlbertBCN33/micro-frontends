import { PageTitleComponent } from '@micro-frontends/ui-components';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'app-documentation',
	standalone: true,
	imports: [CommonModule, RouterModule, PageTitleComponent],
	providers: [TranslateService],
	templateUrl: './documentation.component.html',
	styleUrl: './documentation.component.sass',
})
export class DocumentationComponent implements OnInit {
	ngOnInit(): void {
		console.log('inside DocumentationComponent');
	}
}
