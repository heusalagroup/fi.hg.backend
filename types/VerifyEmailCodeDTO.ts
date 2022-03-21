// Copyright (c) 2021-2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import {
    hasNoOtherKeys,
    isRegularObject,
    isString
} from "../../core/modules/lodash";
import {
    EmailTokenDTO,
    isEmailTokenDTO
} from "./EmailTokenDTO";

export interface VerifyEmailCodeDTO {
    readonly token : EmailTokenDTO;
    readonly code  : string;
}

export function isVerifyEmailCodeDTO (value: any): value is VerifyEmailCodeDTO {
    return (
        isRegularObject(value)
        && hasNoOtherKeys(value, [
            'token',
            'code'
        ])
        && isEmailTokenDTO(value?.token)
        && isString(value?.code)
    );
}

export function stringifyVerifyEmailCodeDTO (value: VerifyEmailCodeDTO): string {
    return `VerifyEmailCodeDTO(${value})`;
}

export function parseVerifyEmailCodeDTO (value: any): VerifyEmailCodeDTO | undefined {
    if ( isVerifyEmailCodeDTO(value) ) return value;
    return undefined;
}


