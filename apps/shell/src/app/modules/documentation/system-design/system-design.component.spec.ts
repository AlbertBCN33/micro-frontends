import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SystemDesignComponent } from './system-design.component';

describe('SystemDesignComponent', () => {
	let component: SystemDesignComponent;
	let fixture: ComponentFixture<SystemDesignComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [SystemDesignComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(SystemDesignComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
