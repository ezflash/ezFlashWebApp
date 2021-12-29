import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FileFetcherService {
  constructor(private http: HttpClient) {}

  getArrayFile(filename: string) {
    // The Observable returned by get() is of type Observable<string>
    // because a text response was specified.
    // There's no need to pass a <string> type parameter to get().
    return this.http
      .get(filename, { responseType: 'arraybuffer' })
      .pipe
      // tap( // Log the result or error
      //   data => console.log(filename, data),
      //   error => console.log(filename, error)
      // )
      ();
  }
  getTextFile(filename: string) {
    // The Observable returned by get() is of type Observable<string>
    // because a text response was specified.
    // There's no need to pass a <string> type parameter to get().
    return this.http
      .get(filename, { responseType: 'text' })
      .pipe
      // tap( // Log the result or error
      //   data => console.log(filename, data),
      //   error => console.log(filename, error)
      // )
      ();
  }
}
