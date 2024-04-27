import { Injectable } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';

export const LOCATIONS: string = "locations";

@Injectable()
export class LocationService {

  // Use a Set to avoid repeating zipcodes
  private locations: Set<string> = new Set();
  readonly addedLocation$: Subject<string> = new ReplaySubject<string>();
  readonly removedLocation$: Subject<string> = new Subject<string>();

  constructor() {
    const locString = localStorage.getItem(LOCATIONS);
    if (locString) {
      this.locations = new Set(JSON.parse(locString));
    }

    for (let loc of this.locations) {
      this.addedLocation$.next(loc);
    }
  }

  addLocation(zipcode: string) {
    this.locations.add(zipcode);
    localStorage.setItem(LOCATIONS, JSON.stringify([...this.locations]));
    this.addedLocation$.next(zipcode);
  }

  removeLocation(zipcode: string) {
    this.locations.delete(zipcode);
    localStorage.setItem(LOCATIONS, JSON.stringify([...this.locations]));
    this.removedLocation$.next(zipcode);
  }
}
