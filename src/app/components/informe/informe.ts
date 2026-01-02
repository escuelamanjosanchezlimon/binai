import { AfterViewInit, Component, HostListener, inject } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { InformeService, IngresosEgresosMes } from './informe.service';

Chart.register(...registerables);

@Component({
  selector: 'app-informe',
  templateUrl: './informe.html',
  styleUrl: './informe.scss',
})
export class Informe implements AfterViewInit {

  private informeService = inject(InformeService);
  chart!: Chart;

  ngAfterViewInit(): void {
    this.crearChart();
    this.cargarDatos();
  }

  crearChart() {
    this.chart = new Chart('myChart', {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Ingresos',
            data: [],
            backgroundColor: '#4CAF50',
            borderColor: '#388E3C',
            borderRadius: 8
          },
          {
            label: 'Gastos',
            data: [],
            backgroundColor: '#F44336',
            borderColor: '#D32F2F',
            borderRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
  cargarDatos() {
    this.informeService.obtenerIngresosEgresosUltimos3Meses()
      .subscribe(data => {

        this.chart.data.labels = data.map(d => {
          const [y, m] = d.mes.split('-');
          return new Date(+y, +m - 1)
            .toLocaleString('es-ES', { month: 'short' });
        });

        this.chart.data.datasets[0].data = data.map(d => d.total_ingresos);
        this.chart.data.datasets[1].data = data.map(d => d.total_egresos);

        this.chart.update();
      });
  }

  @HostListener('window:resize')
  onResize() {
    this.chart?.resize();
  }
}
