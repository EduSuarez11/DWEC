import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { cacheHttpInterceptor } from './interceptors/cache-http-interceptor';
import { authJWTInterceptor } from './interceptors/auth-jwt-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient( withInterceptors( [cacheHttpInterceptor, authJWTInterceptor] ) ),
  ]
};
