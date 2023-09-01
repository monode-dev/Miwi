import "../b-x";
import { Sty } from "../b-x";
import { type JSX, type ParentProps } from "solid-js";
type BDashXProps = ParentProps & {
    sty?: Sty;
} & JSX.DOMAttributes<HTMLDivElement>;
declare module "solid-js" {
    const element: HTMLElement;
    namespace JSX {
        interface IntrinsicElements {
            "b-x": BDashXProps;
        }
    }
}
export declare function parseSty(props: BoxProps, defaultSty?: Partial<Sty>): Partial<Sty>;
export declare function grow(flex?: number): string;
export type BoxProps = Partial<Sty> & BDashXProps;
export declare function Box(props: BoxProps): JSX.Element;
export {};
