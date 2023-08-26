import { mdColors } from "../b-x/BoxDecoration";
import { Align, Axis, Overflow } from "../b-x/BoxLayout";
export function registerGlobalProperties(vueApp) {
    vueApp.config.globalProperties.$Axis = Axis;
    vueApp.config.globalProperties.$Overflow = Overflow;
    vueApp.config.globalProperties.$Align = Align;
    vueApp.config.globalProperties.$mdColors = mdColors;
}
