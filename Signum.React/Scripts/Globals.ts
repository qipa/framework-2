﻿
Array.prototype.groupByArray = function (keySelector: (element: any) => string): { key: string; elements: any[] }[] {
    const result: { key: string; elements: any[] }[] = [];
    const objectGrouped = this.groupByObject(keySelector);
    for (const prop in objectGrouped) {
        if (objectGrouped.hasOwnProperty(prop))
            result.push({ key: prop, elements: objectGrouped[prop] });
    }
    return result;
};

Array.prototype.groupByObject = function (keySelector: (element: any) => string): { [key: string]: any[] } {
    const result: { [key: string]: any[] } = {};

    for (let i = 0; i < this.length; i++) {
        const element: any = this[i];
        const key = keySelector(element);
        if (!result[key])
            result[key] = [];
        result[key].push(element);
    }
    return result;
};

Array.prototype.orderBy = function (keySelector: (element: any) => any): any[] {
    const cloned = (<any[]>this).slice(0);
    cloned.sort((e1, e2) => {
        const v1 = keySelector(e1);
        const v2 = keySelector(e2);
        if (v1 > v2)
            return 1;
        if (v1 < v2)
            return -1;
        return 0;
    });
    return cloned;
};

Array.prototype.orderByDescending = function (keySelector: (element: any) => any): any[] {
    const cloned = (<any[]>this).slice(0);
    cloned.sort((e1, e2) => {
        const v1 = keySelector(e1);
        const v2 = keySelector(e2);
        if (v1 < v2)
            return 1;
        if (v1 > v2)
            return -1;
        return 0;
    });
    return cloned;
};

Array.prototype.toObject = function (keySelector: (element: any) => any, valueSelector?: (element: any) => any): any {
    const obj = {};

    (<Array<any>>this).forEach(item=> {
        const key = keySelector(item);

        if (obj[key])
            throw new Error("Repeated key {0}".formatWith(key));


        obj[key] = valueSelector ? valueSelector(item) : item;
    });

    return obj;
};

Array.prototype.toObjectDistinct = function (keySelector: (element: any) => any, valueSelector?: (element: any) => any): any {
    const obj = {};

    (<Array<any>>this).forEach(item=> {
        const key = keySelector(item);

        obj[key] = valueSelector ? valueSelector(item) : item;
    });

    return obj;
};

Array.prototype.flatMap = function (selector: (element: any, index: number, array: any[]) => any[]): any {

    const array = [];
    (<Array<any>>this).forEach((item, index, array) =>
        selector(item, index, array).forEach(item2 =>
            array.push(item2)
        ));

    return array;
};

Array.prototype.max = function () {
    return Math.max.apply(null, this);
};

Array.prototype.min = function () {
    return Math.min.apply(null, this);
};


Array.prototype.first = function (errorContext) {

    if (this.length == 0)
        throw new Error("No " + (errorContext || "element") + " found");

    return this[0];
};


Array.prototype.firstOrNull = function () {

    if (this.length == 0)
        return null;

    return this[0];
};

Array.prototype.last = function (errorContext) {

    if (this.length == 0)
        throw new Error("No " + (errorContext || "element") + " found");

    return this[this.length - 1];
};


Array.prototype.lastOrNull = function () {

    if (this.length == 0)
        return null;

    return this[this.length - 1];
};

Array.prototype.single = function (errorContext) {

    if (this.length == 0)
        throw new Error("No " + (errorContext || "element")  + " found");

    if (this.length > 1)
        throw new Error("More than one " + (errorContext || "element")  + " found");

    return this[0];
};

Array.prototype.singleOrNull = function (errorContext) {

    if (this.length == 0)
        return null;

    if (this.length > 1)
        throw new Error("More than one " + (errorContext || "element")  + " found");

    return this[0];
};

Array.prototype.contains = function (element) {
    return (this as Array<any>).indexOf(element) != -1;
};

Array.prototype.removeAt = function (index) {
    (this as Array<any>).splice(index, 1);
};

Array.prototype.remove = function (element) {

    const index = (this as Array<any>).indexOf(element);
    if (index == -1)
        return false;

    (this as Array<any>).splice(index, 1);
    return true;
};

Array.prototype.insertAt = function (index, element) {
    (this as Array<any>).splice(index, 0, element);
};

Array.prototype.clone = function () {
    return (this as Array<any>).slice(0);
};

Array.prototype.joinComma = function (lastSeparator: string) {
    const array = this as any[];

    if (array.length == 0)
        return "";

    if (array.length == 1)
        return array[0] == null ? "" : array[0].toString(); 

    const lastIndex = array.length - 1;

    const rest = array.slice(0, lastIndex).join(", ");

    return rest + lastSeparator + (array[lastIndex] == null ? "" : array[lastIndex].toString()); 
};


Array.range = function (min, max) {

    const length = max - min;

    const result = new Array(length);
    for (let i = 0; i < length; i++) {
        result[i] = min + i;
    }

    return result;
}

String.prototype.hasText = function () {
    return (this == null || this == undefined || this == '') ? false : true;
}

String.prototype.contains = function (str) {
    return this.indexOf(str) !== -1;
}

String.prototype.startsWith = function (str) {
    return this.indexOf(str) === 0;
}

String.prototype.endsWith = function (str) {
    return this.lastIndexOf(str) === (this.length - str.length);
}

String.prototype.formatWith = function () {
    const regex = /\{([\w-]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?\}/g;

    const args = arguments;

    return this.replace(regex, function (match) {
        //match will look like {sample-match}
        //key will be 'sample-match';
        const key = match.substr(1, match.length - 2);

        return args[key];
    });
};

String.prototype.formatHtml = function () {
    const regex = /\{([\w-]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?\}/g;

    const args = arguments;

    const parts = this.split(regex);

    const result = [];
    for (let i = 0; i < parts.length - 4; i += 4) {
        result.push(parts[i]);
        result.push(args[parts[i + 1]]);
    }
    result.push(parts[parts.length - 1]);

    return result;
};

String.prototype.forGenderAndNumber = function (gender: any, number?: number) {

    if (!number && !isNaN(parseFloat(gender))) {
        number = gender;
        gender = null;
    }

    if ((gender == null || gender == "") && number == null)
        return this;

    function replacePart(textToReplace: string, ...prefixes: string[]): string {
        return textToReplace.replace(/\[[^\]\|]+(\|[^\]\|]+)*\]/g, m => {
            const captures = m.substr(1, m.length - 2).split("|");

            for (let i = 0; i < prefixes.length; i++){
                const pr = prefixes[i];
                const capture = captures.filter(c => c.startsWith(pr)).firstOrNull();
                if (capture != null)
                    return capture.substr(pr.length);
            }

            return "";
        });
    }
             

    if (number == null)
        return replacePart(this, gender + ":");

    if (gender == null) {
        if (number == 1)
            return replacePart(this, "1:");

        return replacePart(this, number + ":", ":", "");
    }

    if (number == 1)
        return replacePart(this, "1" + gender.Value + ":", "1:");

    return replacePart(this, gender.Value + number + ":", gender.Value + ":", number + ":", ":");


};


export function isNumber(n: any): boolean {
    return !isNaN(parseFloat(n)) && isFinite(n);
}


String.prototype.replaceAll = function (from, to) {
    return this.split(from).join(to)
};

String.prototype.before = function (separator) {
    const index = this.indexOf(separator);
    if (index == -1)
        throw Error("{0} not found".formatWith(separator));

    return this.substring(0, index);
};

String.prototype.after = function (separator) {
    const index = this.indexOf(separator);
    if (index == -1)
        throw Error("{0} not found".formatWith(separator));

    return this.substring(index + separator.length);
};

String.prototype.tryBefore = function (separator) {
    const index = this.indexOf(separator);
    if (index == -1)
        return null;

    return this.substring(0, index);
};

String.prototype.tryAfter = function (separator) {
    const index = this.indexOf(separator);
    if (index == -1)
        return null;

    return this.substring(index + separator.length);
};

String.prototype.beforeLast = function (separator) {
    const index = this.lastIndexOf(separator);
    if (index == -1)
        throw Error("{0} not found".formatWith(separator));

    return this.substring(0, index);
};

String.prototype.afterLast = function (separator) {
    const index = this.lastIndexOf(separator);
    if (index == -1)
        throw Error("{0} not found".formatWith(separator));

    return this.substring(index + separator.length);
};

String.prototype.tryBeforeLast = function (separator) {
    const index = this.lastIndexOf(separator);
    if (index == -1)
        return null;

    return this.substring(0, index);
};

String.prototype.tryAfterLast = function (separator) {
    const index = this.lastIndexOf(separator);
    if (index == -1)
        return null;

    return this.substring(index + separator.length);
};

String.prototype.firstUpper = function () {
    return (this[0] as string).toUpperCase() + this.substring(1);
};

String.prototype.firstLower = function () {
    return (this[0] as string).toLowerCase() + this.substring(1);
};


if (typeof String.prototype.trim !== 'function') {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/, '');
    }
}




export function hasFlag(value: number, flag: number): boolean {
    return (value & flag) == flag;
}

export module Dic {

    export function getValues<V>(obj: { [key: string]: V }): V[] {
        const result: V[] = [];

        for (const name in obj) {
            if (obj.hasOwnProperty(name)) {
                result.push(obj[name]);
            }
        }

        return result;
    }

    export function getKeys(obj: { [key: string]: any }): string[] {
        const result: string[] = [];

        for (const name in obj) {
            if (obj.hasOwnProperty(name)) {
                result.push(name);
            }
        }

        return result;
    }

    export function map<V, R>(obj: { [key: string]: V }, selector: (key: string, value: V) => R): R[] {

        const result: R[] = [];
        for (const name in obj) {
            if (obj.hasOwnProperty(name)) {
                result.push(selector(name, obj[name]));
            }
        }
        return result;
    }

    export function foreach<V>(obj: { [key: string]: V }, action: (key: string, value: V) => void) {

        for (const name in obj) {
            if (obj.hasOwnProperty(name)) {
                action(name, obj[name]);
            }
        }
    }


    export function addOrThrow<V>(dic: { [key: string]: V }, key: string, value: V, errorContext?: string) {
        if (dic[key])
            throw new Error(`Key ${key} already added` + (errorContext ? "in " + errorContext : ""));

        dic[key] = value;
    }

    export function copy<T>(object: T): T {
        const objectCopy = <T>{};

        for (const key in object) {
            if (object.hasOwnProperty(key)) {
                objectCopy[key] = object[key];
            }
        }

        return objectCopy;
    }

    export function extend<O>(out: O): O;
    export function extend<O, U>(out: O, arg1: U): O & U;
    export function extend<O, U, V>(out: O, arg1: U, arg2: V): O & U & V;
    export function extend<O, U, V>(out: O, ...args: Object[]): any;
    export function extend(out) {
        out = out || {};

        for (let i = 1; i < arguments.length; i++) {

            const a = arguments[i];

            if (!a)
                continue;

            for (const key in a) {
                if (a.hasOwnProperty(key) && a[key] !== undefined)
                    out[key] = a[key];
            }
        }

        return out;
    };

    /**  Waiting for https://github.com/Microsoft/TypeScript/issues/2103 */
    export function without<T>(obj: T, toRemove: {}): T {
        const result = {};

        for (const key in obj) {
            if (toRemove.hasOwnProperty(key) && !toRemove.hasOwnProperty(key))
                result[key] = obj[key];
        }

        return result as T;
    }
}



export function classes(...classNames: string[]) {
    return classNames.filter(a=> a != null && a != "").join(" ");
}



export function areEqual<T>(a: T, b: T, field: (value: T) => any) {
    if (a == null)
        return b == null;

    if (b == null)
        return false;

    return field(a) == field(b);
}

export module DomUtils {
    export function matches(elem: HTMLElement, selector: string): boolean {
        // Vendor-specific implementations of `Element.prototype.matches()`.
        const proto = Element.prototype as any;
        const nativeMatches = proto.matches ||
            proto.webkitMatchesSelector ||
            proto.mozMatchesSelector ||
            proto.msMatchesSelector ||
            proto.oMatchesSelector;

        if (!elem || elem.nodeType !== 1) {
            return false;
        }

        const parentElem = elem.parentNode as HTMLElement;

        // use native 'matches'
        if (nativeMatches) {
            return nativeMatches.call(elem, selector);
        }

        // native support for `matches` is missing and a fallback is required
        const nodes = parentElem.querySelectorAll(selector);
        const len = nodes.length;

        for (let i = 0; i < len; i++) {
            if (nodes[i] === elem) {
                return true;
            }
        }

        return false;
    }

    export function closest(element: HTMLElement, selector: string, context?: Node): HTMLElement {
        context = context || document;
        // guard against orphans
        while (!matches(element, selector)) {
            if (element == context)
                return null;

            element = element.parentNode as HTMLElement;
        }

        return element;
    }
}
