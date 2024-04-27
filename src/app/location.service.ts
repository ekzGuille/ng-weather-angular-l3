import { Injectable } from '@angular/core';
import {WeatherService} from "./weather.service";

export const LOCATIONS : string = "locations";

@Injectable()
export class LocationService {

  locations: Set<string> = new Set();

  constructor(private weatherService : WeatherService) {
    let locString = localStorage.getItem(LOCATIONS);
    if (locString) {
      this.locations = new Set(JSON.parse(locString));
    }
    for (let loc of this.locations) {
      this.weatherService.addCurrentConditions(loc);
    }
  }

  addLocation(zipcode : string) {
    this.locations.add(zipcode);
    localStorage.setItem(LOCATIONS, JSON.stringify([...this.locations]));
    this.weatherService.addCurrentConditions(zipcode);
  }

  removeLocation(zipcode : string) {
    this.locations.delete(zipcode);
    localStorage.setItem(LOCATIONS, JSON.stringify([...this.locations]));
    this.weatherService.removeCurrentConditions(zipcode);
  }
}
