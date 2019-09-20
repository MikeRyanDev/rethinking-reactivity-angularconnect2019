import {
  Component,
  OnInit,
  OnDestroy,
  ɵmarkDirty as markDirty
} from "@angular/core";
import { Subject, Observable, from, ReplaySubject, concat } from "rxjs";
import { scan, startWith, mergeMap, tap, takeUntil } from "rxjs/operators";

type ObservableDictionary<T> = {
  [P in keyof T]: Observable<T[P]>;
};

const OnInitSubject = Symbol("OnInitSubject");
const OnDestroySubject = Symbol("OnDestroySubject");
export abstract class ReactiveComponent implements OnInit, OnDestroy {
  private [OnInitSubject] = new ReplaySubject<true>(1);
  private [OnDestroySubject] = new ReplaySubject<true>(1);

  public get onInit$() {
    return this[OnInitSubject].asObservable();
  }

  public get onDestroy$() {
    return this[OnDestroySubject].asObservable();
  }

  connect<T>(sources: ObservableDictionary<T>): T {
    const sink = {} as T;
    const sourceKeys = Object.keys(sources) as (keyof T)[];
    const updateSink$ = from(sourceKeys).pipe(
      mergeMap(sourceKey => {
        const source$ = sources[sourceKey];

        return source$.pipe(
          tap((sinkValue: any) => {
            sink[sourceKey] = sinkValue;
          })
        );
      })
    );

    concat(this.onInit$, updateSink$)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(() => markDirty(this));

    return sink;
  }

  ngOnInit() {
    this[OnInitSubject].next(true);
    this[OnInitSubject].complete();
  }

  ngOnDestroy() {
    this[OnDestroySubject].next(true);
    this[OnDestroySubject].complete();
  }
}

@Component({
  selector: "app-root",
  template: `
    <div class="count">{{ state.count }}</div>
    <div class="countLabel">Count</div>
    <button class="decrement" (click)="values$.next(-1)">
      <i class="material-icons">
        remove
      </i>
    </button>
    <button class="increment" (click)="values$.next(+1)">
      <i class="material-icons">
        add
      </i>
    </button>
  `
})
export class AppComponent extends ReactiveComponent {
  values$ = new Subject<number>();
  state = this.connect({
    count: this.values$.pipe(
      startWith(0),
      scan((count, next) => count + next, 0)
    )
  });

  pushValue(value: number) {
    this.values$.next(value);
  }
}
