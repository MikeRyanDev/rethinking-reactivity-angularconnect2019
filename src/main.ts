import {
  enableProdMode,
  ɵrenderComponent as renderComponent,
  ɵLifecycleHooksFeature as LifecycleHooksFeature
} from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { environment } from "./environments/environment";
import { AppComponent } from "./app/app.component";
import { AppModule } from "./app/app.module";

if (environment.production) {
  enableProdMode();
}

// renderComponent(AppComponent, {
//   hostFeatures: [LifecycleHooksFeature]
// });

platformBrowserDynamic()
  .bootstrapModule(AppModule, { ngZone: "noop" })
  .catch(console.error);
