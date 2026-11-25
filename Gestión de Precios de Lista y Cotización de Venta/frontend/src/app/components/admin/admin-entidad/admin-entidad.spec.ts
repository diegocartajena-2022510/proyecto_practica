import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminEntidad } from './admin-entidad';

describe('AdminEntidad', () => {
  let component: AdminEntidad;
  let fixture: ComponentFixture<AdminEntidad>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEntidad],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminEntidad);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
