import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Cotizar } from './cotizar';

describe('Cotizar', () => {
  let component: Cotizar;
  let fixture: ComponentFixture<Cotizar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cotizar],
    }).compileComponents();

    fixture = TestBed.createComponent(Cotizar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
