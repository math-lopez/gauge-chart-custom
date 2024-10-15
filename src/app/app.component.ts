import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // Propriedade vinculada ao ngModel
  value: number = 500; // Valor inicial (0 a 1000)

  // Propriedades do gauge
  strokeDashoffset: number = 0;
  strokeColor: string = 'rgb(255,0,0)';
  displayText: string = '500';

  // Parâmetros do círculo
  radius: number = 125;
  circumference: number = 2 * Math.PI * 125;
  halfCircumference: number = Math.PI * 125;

  constructor() { }

  ngOnInit(): void {
    this.updateChart();
  }

  // Atualiza o gauge com base no valor
  updateChart() {
    const clampedValue = Math.max(0, Math.min(1000, this.value));
    const progress = clampedValue / 1000; // Valor entre 0 e 1

    // Calcular o offset do traçado para o semi-círculo
    this.strokeDashoffset = this.halfCircumference * (1 - progress);

    // Determinar a cor com base no progresso
    this.strokeColor = this.getColor(progress);

    // Atualizar o texto exibido
    this.displayText = `${clampedValue}`;
  }

  // Função para obter a cor baseada no progresso (0 a 1)
  getColor(progress: number): string {
    // Transição do vermelho (0) ao verde (1), passando pelo amarelo (0.5)
    const red = progress < 0.5 ? 255 : Math.floor(255 - (progress - 0.5) * 510);
    const green = progress > 0.5 ? 255 : Math.floor(progress * 510);
    return `rgb(${red}, ${green}, 0)`;
  }
}
