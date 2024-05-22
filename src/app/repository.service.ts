import { Injectable, inject } from '@angular/core';
import { environment } from '../environments/environment';
import { UUID } from 'crypto';
import { HttpClient } from '@angular/common/http';
import { ContactForm } from '../models/contact-form.model';
import { ContactInfo } from '../models/contact-info.model';

@Injectable({
  providedIn: 'root',
})
export class RepositoryService {
  private apiUrl = environment.apiUrl;
  private readonly httpClient = inject(HttpClient);

  getContactForm(id: UUID) {
    return this.httpClient.get<ContactForm>(`${this.apiUrl}/${id}`);
  }

  addContact(id: UUID, data: ContactInfo) {
    return this.httpClient.post(`${this.apiUrl}/${id}`, data);
  }
}
