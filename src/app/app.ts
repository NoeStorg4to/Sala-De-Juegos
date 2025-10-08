import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { SalaChat } from './components/sala.chat/sala.chat';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Navbar, RouterOutlet, CommonModule, SalaChat],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Sprint-1');
}
