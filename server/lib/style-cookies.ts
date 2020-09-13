import { serialize, parse, CookieSerializeOptions } from 'cookie';

export function getCookie(name: string) {
    const cookies = parse(document.cookie);
    return cookies[name];
}

export function setCookie(name: string, value: string, options?: CookieSerializeOptions) {
    const newCookie = serialize(name, value, options);
    document.cookie = newCookie;
}