import { Component, JSX } from "solid-js";
import { Signal } from "./utils";
import { gsap } from "gsap";
export interface PageTransition {
    enter: (el: Element, done: () => void) => void;
    leave: (el: Element, done: () => void) => void;
}
declare function transitionFrom(options: gsap.TweenVars): PageTransition;
export declare const pageTransitions: {
    from: typeof transitionFrom;
    slideUp: (options?: gsap.TweenVars) => PageTransition;
    fadeIn: (options?: gsap.TweenVars) => PageTransition;
    none: {
        enter(el: Element, done: () => void): void;
        leave(el: Element, done: () => void): void;
    };
};
export interface NavPage<T> {
    component: Component<T>;
    transitions: PageTransition;
}
export declare const useNav: () => {
    notchHeight: Signal<string>;
    openedPages: import("./utils").Getter<(NavPage<any> & {
        props: any;
    })[]>;
    pushPage<T>(newPage: Component<T>, props?: {} | T): void;
    popPage: () => void;
    currentPage: import("./utils").Getter<NavPage<any> & {
        props: any;
    }>;
};
export declare function pushPage<T>(newPage: Component<T>, props?: T | {}): void;
export declare function popPage(): void;
export declare function Nav(props: {
    isOnline: Signal<boolean>;
}): JSX.Element;
export {};
