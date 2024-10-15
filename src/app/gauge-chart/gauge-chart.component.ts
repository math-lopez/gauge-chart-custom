import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gauge-chart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gauge-chart.component.html',
  styleUrls: ['./gauge-chart.component.scss']
})
export class GaugeChartComponent {

  @Input() valueScore: number = 250;
  @Input() useDarkGrayOutline: boolean = true;
  displayValue: number = 250;
  currentScore: number = 0;

  segments: Segment[] = [
    { id: 1, value: 0, color: '#ff4e42', fillPercentage: 0, angle: 55, spacing: 6 },
    { id: 2, value: 0, color: '#ffa500', fillPercentage: 0, angle: 25, spacing: 6 },
    { id: 3, value: 0, color: '#00ff00', fillPercentage: 0, angle: 25, spacing: 6 },
    { id: 4, value: 0, color: '#00b050', fillPercentage: 0, angle: 55, spacing: 0 }
  ];

  radius: number = 125;
  initialOffset: number = 180;
  segmentStartAngles: number[] = [];
  animationFrame!: number;

  constructor() { }

  ngOnChanges(changes: any): void {
    if (changes.valueScore) {
      this.animateValue(this.valueScore, this.displayValue);
    }
  }

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
    for (let i = 0; i < this.segments.length; i++) {
      this.segmentStartAngles.push(currentAngle);
      currentAngle += this.segments[i].angle + this.segments[i].spacing;
    }
  }

  updateChart() {
    const clampedValue = Math.max(0, Math.min(1000, this.currentScore));

    this.displayValue = clampedValue;

    const thresholdForRed = 300;
    const thresholdForYellow = 500;
    const thresholdForFirstGreen = 700;
    const thresholdForLastGreen = 1000;

    for (let i = 0; i < this.segments.length; i++) {
      let fillPercentage = 0;

      if (i === 0) {
        const segmentMaxValue = Math.min(clampedValue, thresholdForRed);
        this.segments[i].value = segmentMaxValue;
        if (clampedValue >= thresholdForRed) {
          this.segments[i].value = thresholdForRed;
          fillPercentage = 100;
        } else {
          fillPercentage = (segmentMaxValue / thresholdForRed) * 100;
        }
      } 
      else if (i === 1) {
        if (clampedValue > thresholdForRed) {
          const excessValue = Math.min(clampedValue - thresholdForRed, thresholdForYellow - thresholdForRed);
          this.segments[i].value = excessValue;
          fillPercentage = (excessValue / (thresholdForYellow - thresholdForRed)) * 100;
        } else if (clampedValue >= thresholdForRed) {
          this.segments[i].value = thresholdForYellow - thresholdForRed;
          fillPercentage = 100;
        } else {
          this.segments[i].value = 0;
          fillPercentage = 0;
        }
      } 
      else if (i === 2) {
        if (clampedValue > thresholdForYellow && clampedValue <= thresholdForFirstGreen) {
          const excessValue = clampedValue - thresholdForYellow;
          this.segments[i].value = excessValue;
          fillPercentage = (excessValue / (thresholdForFirstGreen - thresholdForYellow)) * 100;
        } else if (clampedValue > thresholdForFirstGreen) {
          this.segments[i].value = thresholdForFirstGreen - thresholdForYellow;
          fillPercentage = 100;
        } else {
          this.segments[i].value = 0;
          fillPercentage = 0;
        }
      } 
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

      // Verifica se deve aplicar o cinza escuro ou o gradiente
      this.segments[i].color = this.useDarkGrayOutline ? '#A9A9A9' : this.getGradient(i);
    }
  }

  // Método para obter o gradiente ou o cinza escuro
  getGradient(index: number): string {
    if (this.useDarkGrayOutline) {
      return '#A9A9A9';  // Aplica cinza escuro a todos os segmentos
    }

    // Aplica os gradientes normais se o modo cinza escuro não estiver ativado
    if (index === 0) {
      return 'url(#redToYellow)';
    } else if (index === 1) {
      return 'url(#yellowToGreen)';
    } else if (index === 2) {
      return 'url(#greenToDarkGreen)';
    } else if (index === 3) {
      return 'url(#darkGreenToBlack)';
    } else {
      return this.segments[index].color;  // Cor sólida para o último segmento
    }
  }

  describeArc(startAngle: number, angleSpan: number, radius: number): string {
    const endAngle = startAngle + angleSpan;
    const start = this.polarToCartesian(0, 0, radius, startAngle);
    const end = this.polarToCartesian(0, 0, radius, endAngle);
    const largeArcFlag = angleSpan > 180 ? 1 : 0;
    const sweepFlag = 1;

    const d = [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, sweepFlag, end.x, end.y
    ].join(' ');

    return d;
  }

  polarToCartesian(centerX: number, centerY: number, radius: number, angle: number): { x: number, y: number } {
    const angleRad = (angle) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleRad)),
      y: centerY + (radius * Math.sin(angleRad))
    };
  }

  animateValue(target: number, current: number, duration: number = 1000) {
    const startTime = performance.now();
    const initialValue = this.currentScore;
    const difference = target - initialValue;

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      this.currentScore = Math.round(initialValue + difference * this.easeOutCubic(progress));

      this.displayValue = this.currentScore;
      this.updateChart();  

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(step);
      }
    };

    cancelAnimationFrame(this.animationFrame);
    this.animationFrame = requestAnimationFrame(step);
  }

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
