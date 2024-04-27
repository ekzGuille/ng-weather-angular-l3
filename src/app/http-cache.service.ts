import { Inject, Injectable, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { of } from 'rxjs';


export const EXPIRATION_CACHE = new InjectionToken<ExpirationCache>('EXPIRATION_CACHE', {
  factory: () => ({
    hours: 2,
    minutes: 0,
    seconds: 0,
  }),
});

@Injectable()
export class HttpCacheService {

  private readonly storedKeys: Set<string> = new Set();
  private readonly cacheRequests: Map<string, unknown> = new Map();
  private readonly EXPIRATION_DATE_KEY = 'expiration_date';
  private readonly STORED_KEYS_KEY = 'stored_keys';
  private readonly cacheExpirationDate: number;
  private expirationDate: number = new Date().getTime();
  private hours: number = 0;
  private minutes: number = 0;
  private seconds: number = 0;

  constructor(private readonly httpClient: HttpClient, @Inject(EXPIRATION_CACHE) expirationCache: ExpirationCache) {
    // Preload cache data
    this.cacheExpirationDate = this.getItem(this.EXPIRATION_DATE_KEY);
    const storedKeys: string[] = this.getItem(this.STORED_KEYS_KEY) ?? [];
    this.storedKeys = new Set([...storedKeys]);
    [...this.storedKeys.keys()].forEach(key => this.cacheRequests.set(key, this.getItem(key)));
    this.setExpirationDate(expirationCache);
  }

  private setExpirationDate(expirationCache: ExpirationCache) {
    this.updateExpirationDate(expirationCache.hours, expirationCache.minutes, expirationCache.seconds)
  }

  updateExpirationDate(hours: number = this.hours, minutes: number = this.minutes, seconds: number = this.seconds): void {
    const currentDate = new Date();
    const expirationDate = new Date();
    if (!this.cacheExpirationDate || currentDate.getTime() > this.cacheExpirationDate) {
      this.hours = hours;
      this.minutes = minutes;
      this.seconds = seconds;
      expirationDate.setHours(currentDate.getHours() + (hours || 0));
      expirationDate.setMinutes(currentDate.getMinutes() + (minutes || 0));
      expirationDate.setSeconds(currentDate.getSeconds() + (seconds || 0));
      this.expirationDate = expirationDate.getTime();
      this.flushCache();
      this.setItem(this.EXPIRATION_DATE_KEY, this.expirationDate);
    } else {
      this.expirationDate = this.cacheExpirationDate;
    }
  }

  getItem<T>(key: string): T {
    return JSON.parse(window.localStorage.getItem(key));
  };

  setItem<T>(key: string, value: T): void {
    this.cacheRequests.set(key, value);
    this.storedKeys.add(key);
    window.localStorage.setItem(key, JSON.stringify(value));
    window.localStorage.setItem(this.STORED_KEYS_KEY, JSON.stringify([...this.storedKeys]));
  };

  deleteItem(key: string): void {
    window.localStorage.removeItem(key);
  };

  private isExpiredDate() {
    const currentDate = new Date().getTime();
    if (currentDate > this.expirationDate) {
      this.flushCache();
      this.updateExpirationDate();
      return true;
    }
    return false;
  }

  private flushCache() {
    [...this.cacheRequests.keys()].forEach(key => this.deleteItem(key));
    this.cacheRequests.clear();
    [...this.storedKeys.keys()].forEach(key => this.deleteItem(key))
    this.storedKeys.clear();
    this.deleteItem(this.EXPIRATION_DATE_KEY);
  }

  get<T>(...params: Parameters<typeof this.httpClient.get>): ReturnType<typeof this.httpClient.get<T>> {
    // The url is first element
    const url = params[0];
    if (!this.cacheRequests.has(url) || this.isExpiredDate()) {
      return this.httpClient.get<T>(...params).pipe(
        tap((data) => {
          this.setItem(url, data);
        }),
      );
    }
    return of(this.getItem(url));
  }
}

export interface ExpirationCache {
  hours?: number;
  minutes?: number;
  seconds?: number;
}
