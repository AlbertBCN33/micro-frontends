import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NxWelcomeComponent } from './nx-welcome.component';
import { LayoutComponent } from './components/layout/layout.component';
// Translations
import { TranslateService } from '@ngx-translate/core';
// Deployment (Firebase)
// import { initializeApp } from 'firebase/app';
// import { getAnalytics } from 'firebase/analytics';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

@Component({
	standalone: true,
	imports: [LayoutComponent, RouterModule],
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrl: './app.component.sass',
})
export class AppComponent {
	title = 'shell';

	constructor(private translate: TranslateService) {
		this.translate.addLangs(['en', 'es']);
		this.translate.setDefaultLang('en');
		this.translate.use('en');
	}
}
