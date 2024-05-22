import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RepositoryService } from './repository.service';
import { UUID } from 'crypto';
import { ContactInfo } from '../models/contact-info.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private readonly repositoryService = inject(RepositoryService);
  private contactFormId: UUID | null = null;

  ngOnInit(): void {
    const urlParams = new URLSearchParams(window.location.search);
    this.contactFormId = urlParams.get('id') as UUID;

    this.repositoryService.getContactForm(this.contactFormId).subscribe({
      next: (next) => {
        document.documentElement.style.setProperty(
          '--customer-color',
          `rgb(${next.color})`
        );
        document.documentElement.style.setProperty(
          '--customer-color-low',
          `rgba(${next.color}, 0.1)`
        );
        document.documentElement.style.setProperty(
          '--customer-font-size',
          `${next.fontSize}pt`
        );

        this.invalidId.set(false);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  isLoading = signal<boolean>(true);
  invalidId = signal<boolean>(true);

  isSelf = signal<boolean | null>(null);
  salutation = signal<number | null>(null);
  firstName = signal<string>('');
  lastName = signal<string>('');
  street = signal<string>('');
  zipCode = signal<string>('');
  careLevel = signal<number | null>(null);

  productWohnreinigung = signal<boolean>(false);
  productFlurwoche = signal<boolean>(false);
  productEinkaufsservice = signal<boolean>(false);
  productBesorgungen = signal<boolean>(false);
  productFensterreinigung = signal<boolean>(false);
  productWaschen = signal<boolean>(false);
  productTerminBegleitung = signal<boolean>(false);
  productBetreuung = signal<boolean>(false);
  productSonstiges = signal<boolean>(false);

  contact = signal<string | null>(null);
  phone = signal<string | null>(null);
  isAccepted = signal<boolean>(false);

  page = signal<number>(1);

  canProceed = computed<boolean>(() => {
    switch (this.page()) {
      case 1:
        return this.isSelf() != null;
      case 2:
        return (
          this.salutation() != null &&
          this.firstName() != '' &&
          this.lastName() != '' &&
          /^[0-9]{5}$/m.test(this.zipCode())
        );
      case 3:
        return this.careLevel() != null;
      case 4:
        return (
          this.productWohnreinigung() ||
          this.productFlurwoche() ||
          this.productEinkaufsservice() ||
          this.productBesorgungen() ||
          this.productFensterreinigung() ||
          this.productWaschen() ||
          this.productTerminBegleitung() ||
          this.productBetreuung() ||
          this.productSonstiges()
        );
      case 5:
        console.log(this.contact() != null || this.isSelf() == true);
        console.log(this.phone() != null);
        return (
          (this.contact() != null || this.isSelf() == true) &&
          this.phone() != null
        );
    }
    return false;
  });

  onNext() {
    if (this.canProceed()) {
      this.page.set(this.page() + 1);
    }
  }

  onBack() {
    if (this.page() > 1) {
      this.page.set(this.page() - 1);
    }
  }

  onFinish() {
    const contactInfo: ContactInfo = {
      careLevel: this.careLevel()!,
      contact: this.contact()!,
      firstName: this.firstName(),
      lastName: this.lastName(),
      phone: this.phone()!,
      products: [
        this.productWohnreinigung(),
        this.productFlurwoche(),
        this.productEinkaufsservice(),
        this.productBesorgungen(),
        this.productFensterreinigung(),
        this.productWaschen(),
        this.productTerminBegleitung(),
        this.productBetreuung(),
        this.productSonstiges(),
      ]
        .map((value, index) => (value ? index + 1 : -1))
        .filter((value) => value !== -1),
      salutation: +this.salutation()!,
      street: this.street(),
      zipCode: this.zipCode(),
    };

    this.repositoryService
      .addContact(this.contactFormId!, contactInfo)
      .subscribe({
        next: () => {
          this.page.set(7);
        },
        error: () => {},
      });
  }
}
