import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';


@Injectable({
  providedIn: 'root',
})
export class Toasts {
  
  constructor(private snackBar: MatSnackBar) {}

  showSuccess(message: string, duration: number = 3000) {
    this.show(message, 'success', duration);
  }

  showError(message: string, duration: number = 4000) {
    this.show(message, 'error', duration);
  }

  showWarning(message: string, duration: number = 3000) {
    this.show(message, 'warning', duration);
  }

  showInfo(message: string, duration: number = 2000) {
    this.show(message, 'info', duration);
  }

  private show(message: string, type: string, duration: number) {
    const config: MatSnackBarConfig = {
      duration: duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [`toast-${type}`]
    };
    
    this.snackBar.open(message, 'Cerrar', config);
  }
  
}
