import { createEffect, createMemo, createSignal, on } from "solid-js";
export function signal(initValue) {
    const [getValue, setValue] = createSignal(initValue);
    return {
        get value() {
            return getValue();
        },
        set value(newValue) {
            setValue(newValue);
        },
    };
}
export function computed(getter) {
    const read = createMemo(getter);
    return {
        get value() {
            return read();
        },
    };
}
export function watchDeps(deps, callback) {
    return createEffect(on(
    // Solid JS expects functions like it is use to.
    deps.map((dep) => () => dep.value), callback));
}
export function watchEffect(callback) {
    return createEffect(callback);
}
export function injectDefaults(props, defaults) {
    return {
        ...defaults,
        ...props,
    };
}
export function exists(x) {
    return x !== undefined && x !== null;
}
export function orderDocs(list, getKey, options) {
    return [...list].sort((a, b) => {
        const direction = options?.direction ?? `normal`;
        const nullPosition = options?.nullPosition ?? `first`;
        const keyA = getKey(direction === `normal` ? a : b);
        const keyB = getKey(direction === `normal` ? b : a);
        if (!exists(keyA)) {
            return nullPosition === `first` ? -1 : 1;
        }
        else if (!exists(keyB)) {
            return nullPosition === `first` ? 1 : -1;
        }
        else {
            if (typeof keyA === `number` && typeof keyB === `number`) {
                return keyA - keyB;
            }
            else {
                return keyA.toString().localeCompare(keyB.toString());
            }
        }
    });
}
export function formatNumWithCommas(num, digits = 0) {
    const rounded = roundToString(num, digits);
    const [whole, decimal] = rounded.split(`.`);
    const wholeWithComma = whole?.replace(/\B(?=(\d{3})+(?!\d))/g, `,`);
    return `${wholeWithComma ?? ``}${exists(decimal) ? `.${decimal}` : ``}`;
}
export function roundToString(num, digits = 0) {
    // Sometimes there are rouding errors. adding a 0.000..01 on the end seems to reduce these.
    const significantDecimals = num.toString().split(`.`)[1]?.length ?? 0;
    const acutalDigits = digits === `min` ? significantDecimals : digits;
    const numRoundingOffset = Math.pow(10, -significantDecimals - 1);
    const digitRoundOffset = Math.pow(10, -acutalDigits - 1);
    const roundingOffset = Math.min(numRoundingOffset, digitRoundOffset);
    return (num + roundingOffset).toFixed(acutalDigits);
}
export const NONE_SELECTED = `noneSelected`;
export const ONE_TIME = `oneTime`;
export const JUST_FUEL = `justFuel`;
export function formatPhoneNumber(input, event) {
    let ogInputLength = input?.length; // GET FULL LENGTH OF INPUT STRING
    let caretPos = event.target?.selectionStart; // GET CURRENT CURSOR POSITION
    let justNums = input?.replace(/\D/g, ""); // STRIP NON-NUMERIC CHARS
    let justNumsLength = justNums?.length; // GET LENGTH OF NUMBER STRING
    if (justNumsLength > 10) {
        input =
            justNums?.slice(0, 3) +
                "-" +
                justNums?.slice(3, 6) +
                "-" +
                justNums?.slice(6, 10) +
                "#" +
                justNums?.slice(10, justNumsLength);
        if (justNumsLength == 11 && caretPos == 13 && ogInputLength != 14) {
            caretPos = 14;
        }
    }
    else if (justNumsLength > 6) {
        input =
            justNums?.slice(0, 3) +
                "-" +
                justNums?.slice(3, 6) +
                "-" +
                justNums?.slice(6, 10);
        if (justNumsLength == 7 && caretPos == 8 && ogInputLength != 9) {
            caretPos = 9;
        }
    }
    else if (justNumsLength > 3) {
        input = justNums?.slice(0, 3) + "-" + justNums?.slice(3, 6);
        if (justNumsLength == 4 && caretPos == 4 && ogInputLength != 5) {
            caretPos = 5;
        }
    }
    else {
        input = justNums;
    }
    return {
        input: input,
        caret: caretPos,
    };
}
export function formatAddress(input, event) {
    for (let i = 0; i < input.length; i++) {
        if (i == 0 || input.charAt(i - 1) == " ") {
            input =
                input.slice(0, i) + input.charAt(i).toUpperCase() + input.slice(i + 1);
        }
    }
    return {
        input: input,
        caret: event.target
            ?.selectionStart,
    };
}
// Tue, March 10th 2021 - 3:00 PM
export function formatPosixTime(posixTime) {
    // Create a new Date object from the posix time
    let date = new Date(posixTime);
    // Array of day names
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    // Array of month names
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    // Get the day of the week, the month and the date
    let dayOfWeek = days[date.getDay()];
    let month = months[date.getMonth()];
    let day = date.getDate();
    let time = date.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
    });
    // Add the ordinal suffix
    let suffix = "";
    switch (day % 10) {
        case 1:
            suffix = day === 11 ? "th" : "st";
            break;
        case 2:
            suffix = day === 12 ? "th" : "nd";
            break;
        case 3:
            suffix = day === 13 ? "th" : "rd";
            break;
        default:
            suffix = "th";
    }
    // Get the year
    let year = date.getFullYear();
    // Return the formatted string
    return `${dayOfWeek}, ${month} ${day}${suffix} ${year} - ${time}`;
}
export function sessionStore(storeName, defineStore) {
    const storePropName = `miwi_sessionStore_${storeName}`;
    return function () {
        if (!exists(window[storePropName])) {
            window[storePropName] = defineStore();
        }
        return window[storePropName];
    };
}
