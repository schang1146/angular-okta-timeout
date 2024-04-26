import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { interval } from 'rxjs';

@Component({
  selector: 'inactive-dialog',
  templateUrl: './inactive-dialog.component.html',
})
export class InactiveDialogComponent implements OnInit {
  remainingTime = this.data.timeToSignOut - new Date().getTime();

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { timeToSignOut: number }
  ) {}

  ngOnInit(): void {
    interval(1000).subscribe(() => {
      this.remainingTime = this.data.timeToSignOut - new Date().getTime();
    });
  }

  // refactor: this would be better served as a pipe
  formatTime(timeInMs: number): string {
    const min = Math.floor(timeInMs / 60000)
      .toString()
      .padStart(2, '0');
    const sec = Math.floor((timeInMs % 60000) / 1000)
      .toString()
      .padStart(2, '0');

    return `${min}:${sec}`;
  }
}
