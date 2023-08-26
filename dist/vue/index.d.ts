import { mdColors } from "../b-x/BoxDecoration";
import { Align, Axis, Overflow } from "../b-x/BoxLayout";
import { _Sty } from "../b-x/index";
declare module "@vue/runtime-core" {
    interface ComponentCustomProperties {
        $Axis: typeof Axis;
        $Overflow: typeof Overflow;
        $Align: typeof Align;
        $mdColors: typeof mdColors;
    }
}
declare module "vue" {
    interface GlobalComponents {
        "b-x": {
            sty?: Sty;
        };
    }
}
declare global {
    type Sty = Partial<_Sty>;
}
export declare function registerGlobalProperties(vueApp: any): void;
