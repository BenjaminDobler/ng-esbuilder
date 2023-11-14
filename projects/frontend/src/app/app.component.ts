import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

// import { readFile } from 'fs';
// import * as fs from 'fs';
const fs = require('fs');

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'frontend';
  
  constructor() {
    fs.readFile('package.json', (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(data.toString());
    });
  }
}
