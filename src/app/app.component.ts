// app.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'] // Correção aqui
})
export class AppComponent implements OnInit {
   
  value: number = 500;

  segments: Segment[] = [
    { id: 1, value: 0, color: '#ff4e42' }, // Vermelho
    { id: 2, value: 0, color: '#ffa500' }, // Amarelo
    { id: 3, value: 0, color: '#00ff00' }, // Verde Claro
    { id: 4, value: 0, color: '#d3d3d3' }  // Cinza (não preenchido)
  ];

  // Parâmetros do círculo
  radius: number = 125;
  segmentSpacing: number = 2; // Espaçamento entre segmentos
  segmentAngle: number = 45;  // Cada segmento cobre 45 graus (180/4)
  initialOffset: number = 180; // Começar no lado esquerdo (180 graus)

  constructor() { }

  ngOnInit(): void {
    this.updateChart();
  }

  updateChart() {
    const clampedValue = Math.max(0, Math.min(1000, this.value));
    const valuePerSegment = 250; // 1000 / 4

    for (let i = 0; i < this.segments.length; i++) {
      const segmentValue = Math.min(clampedValue - (i * valuePerSegment), valuePerSegment);
      this.segments[i].value = segmentValue > 0 ? segmentValue : 0;

      // Alterar a cor para cinza quando o valor não preencher o segmento
      if (this.segments[i].value <= 0) {
        this.segments[i].color = '#d3d3d3'; // Cor para o segmento não preenchido
      } else {
        this.segments[i].color = this.getColor(i); // Cor conforme o segmento
      }
    }
  }

  getColor(index: number): string {
    const colors = ['#ff4e42', '#ffa500', '#00ff00', '#00b050'];
    return colors[index];
  }

  describeArc(startAngle: number, angleSpan: number, radius: number): string {
    console.log("T", startAngle, this.segmentSpacing)
    const endAngle = startAngle - angleSpan; // Sentido horário
    const start = this.polarToCartesian(0, 0, radius, startAngle);
    const end = this.polarToCartesian(0, 0, radius, endAngle);
    const largeArcFlag = angleSpan > 180 ? 1 : 0;
    const sweepFlag = 0; // Direção horária corrigida para 0

    const d = [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, sweepFlag, end.x, end.y
    ].join(' ');

    return d;
  }

  polarToCartesian(centerX: number, centerY: number, radius: number, angle: number): { x: number, y: number } {
    const angleRad = (angle - 320) * Math.PI / 180.0; // Começar do lado esquerdo do círculo

    return {
      x: centerX + (radius * Math.cos(angleRad)),
      y: centerY + (radius * Math.sin(angleRad))
    };
  }
}

// Interface para representar cada segmento
interface Segment {
  id: number;
  value: number;
  color: string;
}
