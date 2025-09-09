import { Component, OnInit } from '@angular/core';
import { Github } from '../../services/github';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quien-soy',
  standalone: true,
  imports: [ CommonModule],
  templateUrl: './quien-soy.html',
  styleUrl: './quien-soy.css'
})
export class QuienSoy implements OnInit{
  userData: any;
  isLoading = true;
  error = false;

  private username = 'NoeStorg4to'

  constructor(private github: Github) { }

  ngOnInit(): void {
    this.github.getUserData(this.username).subscribe({
      next: (data) => {
        this.userData = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching GitHub data:', error);
        this.error = true;
        this.isLoading = false;
      }
    });
  }
}
