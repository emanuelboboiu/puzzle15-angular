import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RequestsService {
  apisPath: string = "https://www.limbalatina.ro/15puzzle/api/";

  constructor(private http: HttpClient) {
    // Nothing yet.    
  } // end constructor.

  // Get from server via http get:
  getDataGet(apiFile: string, getParams: string): Observable<any> {
    return this.http.get<any>(this.apisPath + apiFile + getParams);
  } // end getDataGet() method.

} // end requestsService.
