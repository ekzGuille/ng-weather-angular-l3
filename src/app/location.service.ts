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
    const locString = window.localStorage.getItem(LOCATIONS);
    if (locString) {
      this.locations = new Set(JSON.parse(locString));
    }

    for (let loc of this.locations) {
      this.addedLocation$.next(loc);
    }
  }

  addLocation(zipcode: string) {
    const alreadyExists = this.locations.has(zipcode);
    this.locations.add(zipcode);
    window.localStorage.setItem(LOCATIONS, JSON.stringify([...this.locations]));
    // Do not emit if existing. Avoiding duplicates
    if (!alreadyExists) {
      this.addedLocation$.next(zipcode);
    }
  }

  removeLocation(zipcode: string) {
    this.locations.delete(zipcode);
    window.localStorage.setItem(LOCATIONS, JSON.stringify([...this.locations]));
    this.removedLocation$.next(zipcode);
  }
}
