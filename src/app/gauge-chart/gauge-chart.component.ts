import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gauge-chart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gauge-chart.component.html',
  styleUrl: './gauge-chart.component.scss'
})
export class GaugeChartComponent {
 
  @Input() valueScore: number = 250;
  displayValue: number = 250;

  segments: Segment[] = [
    { id: 1, value: 0, color: '#ff4e42', fillPercentage: 0, angle: 55, spacing: 6 }, // Vermelho
    { id: 2, value: 0, color: '#ffa500', fillPercentage: 0, angle: 25, spacing: 6 }, // Amarelo
    { id: 3, value: 0, color: '#00ff00', fillPercentage: 0, angle: 25, spacing: 6 }, // Verde Claro
    { id: 4, value: 0, color: '#00b050', fillPercentage: 0, angle: 55, spacing: 0 }  // Verde Escuro
  ];

  // Parâmetros do círculo
  radius: number = 125;
  initialOffset: number = 180;

  segmentStartAngles: number[] = [];

  constructor() { }

  ngOnInit(): void {
    this.calculateSegmentStartAngles();
    this.updateChart();
  }

  ngOnDestroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  calculateSegmentStartAngles() {
    this.segmentStartAngles = [];
    let currentAngle = this.initialOffset;
    for(let i = 0; i < this.segments.length; i++) {
      this.segmentStartAngles.push(currentAngle);
      currentAngle += this.segments[i].angle + this.segments[i].spacing;
    }
  }

  updateChart(s = "") {
    if (s === 'btn') this.valueScore = Math.round(Math.random() * 1000);
    const clampedValue = Math.max(0, Math.min(1000, this.valueScore));
  
    // Definição dos limites de cada segmento
    const thresholdForRed = 300;        // Limite para o vermelho (0 a 300)
    const thresholdForYellow = 500;     // Limite para o amarelo (301 a 500)
    const thresholdForFirstGreen = 700; // Limite para o verde claro (501 a 700)
    const thresholdForLastGreen = 1000; // Limite para o verde escuro (701 a 1000)
  
    for (let i = 0; i < this.segments.length; i++) {
      let fillPercentage = 0;
  
      // Segmento vermelho (0 a 300)
      if (i === 0) {
        const segmentMaxValue = Math.min(clampedValue, thresholdForRed);
        this.segments[i].value = segmentMaxValue;
  
        if (clampedValue >= thresholdForRed) {
          // Garante que o vermelho fique totalmente preenchido quando o valor ultrapassa 300
          this.segments[i].value = thresholdForRed;
          fillPercentage = 100;
        } else {
          fillPercentage = (segmentMaxValue / thresholdForRed) * 100;
        }
      } 
      // Segmento amarelo (301 a 500)
      else if (i === 1) {
        if (clampedValue > thresholdForRed) {
          const excessValue = Math.min(clampedValue - thresholdForRed, thresholdForYellow - thresholdForRed);
          this.segments[i].value = excessValue;
          fillPercentage = (excessValue / (thresholdForYellow - thresholdForRed)) * 100;
        } else if (clampedValue >= thresholdForRed) {
          // Mantém o preenchimento total do amarelo quando excede o limite anterior
          this.segments[i].value = thresholdForYellow - thresholdForRed;
          fillPercentage = 100;
        } else {
          this.segments[i].value = 0;
          fillPercentage = 0;
        }
      } 
      // Segmento verde claro (501 a 700)
      else if (i === 2) {
        if (clampedValue > thresholdForYellow && clampedValue <= thresholdForFirstGreen) {
          const excessValue = clampedValue - thresholdForYellow;
          this.segments[i].value = excessValue;
          fillPercentage = (excessValue / (thresholdForFirstGreen - thresholdForYellow)) * 100;
        } else if (clampedValue > thresholdForFirstGreen) {
          // Preenche totalmente o verde claro se o valor exceder 700
          this.segments[i].value = thresholdForFirstGreen - thresholdForYellow;
          fillPercentage = 100;
        } else {
          this.segments[i].value = 0;
          fillPercentage = 0;
        }
      } 
      // Segmento verde escuro (701 a 1000)
      else if (i === 3) {
        if (clampedValue > thresholdForFirstGreen) {
          const excessValue = clampedValue - thresholdForFirstGreen;
          this.segments[i].value = excessValue;
          fillPercentage = (excessValue / (thresholdForLastGreen - thresholdForFirstGreen)) * 100;
        } else {
          this.segments[i].value = 0;
          fillPercentage = 0;
        }
      }
  
      this.segments[i].fillPercentage = fillPercentage;
  
      // Ajuste de cores conforme o valor
      if (this.segments[i].value <= 0) {
        this.segments[i].color = '#d3d3d3'; // Cor para o segmento não preenchido
      } else {
        this.segments[i].color = this.getColor(i); // Cor conforme o segmento
      }
    }
  
    // Se estiver usando animação personalizada
    this.animateValue(this.valueScore, this.displayValue);
  }
  
  getColor(index: number): string {
    // Verde claro agora preenche corretamente de 501 a 700
    if (index === 2 && this.valueScore >= 501) {
      return '#00ff00'; // Verde Claro
    } 
    // Verde escuro preenche corretamente de 701 a 1000
    else if (index === 3 && this.valueScore >= 701) {
      return '#00b050'; // Verde Escuro
    } 
    // Amarelo preenche de 301 a 500
    else if (index === 1 && this.valueScore >= 301) {
      return '#ffa500'; // Amarelo
    } 
    // Vermelho preenche de 0 a 300 e permanece preenchido depois de 300
    else if (index === 0 && this.valueScore <= 300) {
      return '#ff4e42'; // Vermelho
    } else if (index === 0 && this.valueScore > 300) {
      return '#ff4e42'; // Vermelho completamente preenchido quando o valor exceder 300
    }
    return '#d3d3d3'; // Cor padrão para segmentos não preenchidos
  }
  
  
  
  
  
  

  describeArc(startAngle: number, angleSpan: number, radius: number): string {
    const endAngle = startAngle + angleSpan; // Sentido horário
    const start = this.polarToCartesian(0, 0, radius, startAngle);
    const end = this.polarToCartesian(0, 0, radius, endAngle);
    const largeArcFlag = angleSpan > 180 ? 1 : 0;
    const sweepFlag = 1; // Direção horária

    const d = [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, sweepFlag, end.x, end.y
    ].join(' ');

    return d;
  }

  polarToCartesian(centerX: number, centerY: number, radius: number, angle: number): { x: number, y: number } {
    const angleRad = (angle) * Math.PI / 180.0; // Usar o ângulo diretamente, sem ajustes
    return {
      x: centerX + (radius * Math.cos(angleRad)),
      y: centerY + (radius * Math.sin(angleRad))
    };
  }

  // Animação personalizada do valor (se não estiver usando CountUp.js)
  animationFrame!: number;

  animateValue(target: number, current: number, duration: number = 1000) {
    const startTime = performance.now();
    const initialValue = this.displayValue;
    const difference = target - initialValue;

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      this.displayValue = Math.round(initialValue + difference * this.easeOutCubic(progress));

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(step);
      }
    };

    cancelAnimationFrame(this.animationFrame);
    this.animationFrame = requestAnimationFrame(step);
  }

  // Função de easing (suavização) opcional
  easeOutCubic(t: number): number {
    return (--t) * t * t + 1;
  }
}

// Interface para representar cada segmento
interface Segment {
  id: number;
  value: number;
  color: string;
  fillPercentage: number; // Percentual de preenchimento (0 a 100)
  angle: number;          // Ângulo do segmento em graus
  spacing: number;        // Espaçamento após o segmento em graus
}