// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { isStringOrUndefined } from "../../core/types/String";
import { isNumberOrUndefined } from "../../core/types/Number";
import { isRegularObject } from "../../core/types/RegularObject";
import { hasNoOtherKeys } from "../../core/types/OtherKeys";

export interface JwtPayload {

    /**
     * Expiration time
     * @see https://www.rfc-editor.org/rfc/rfc7519.html#section-4.1.4
     */
    readonly exp ?: number;

    /**
     * Audience, e.g. the recipient(s) who this JWT is intended for.
     * @see https://www.rfc-editor.org/rfc/rfc7519.html#section-4.1.3
     */
    readonly aud ?: string;

    /**
     * Subject, e.g. the subject of the JWT.
     * @see https://www.rfc-editor.org/rfc/rfc7519.html#section-4.1.2
     */
    readonly sub ?: string;

}

export function createJwtPayload (
    exp ?: number,
    aud ?: string,
    sub ?: string
): JwtPayload {
    return {
        exp,
        aud,
        sub
    };
}

export function isJwtPayload (value: any): value is JwtPayload {
    return (
        isRegularObject(value)
        && hasNoOtherKeys(value, [
            'exp',
            'aud',
            'sub'
        ])
        && isNumberOrUndefined(value?.exp)
        && isStringOrUndefined(value?.aud)
        && isStringOrUndefined(value?.sub)
    );
}

export function stringifyJwtPayload (value: JwtPayload): string {
    return `JwtPayload(${value})`;
}

export function parseJwtPayload (value: any): JwtPayload | undefined {
    if ( isJwtPayload(value) ) return value;
    return undefined;
}
