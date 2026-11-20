import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs";
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  baseURL = `http://localhost:3000/`;
  constructor(private _HttpClient: HttpClient, private _Router: Router) {
  }

  // E3: the backend expects the standard "Authorization: Bearer <accessToken>" header
  authHeaders(): HttpHeaders {
    const token = localStorage.getItem("token");
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  loginWithGmail(data: any): Observable<any> {
    return this._HttpClient.post(this.baseURL + "api/auth/signup-with-google", data);
  }

}
