// Copyright (c) 2021-2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import {
    hasNoOtherKeys,
    isRegularObject
} from "../../core/modules/lodash";
import {
    EmailTokenDTO,
    isEmailTokenDTO
} from "./EmailTokenDTO";

export interface VerifyEmailTokenDTO {
    readonly token : EmailTokenDTO;
}

export function isVerifyEmailTokenDTO (value: any): value is VerifyEmailTokenDTO {
    return (
        isRegularObject(value)
        && hasNoOtherKeys(value, [
            'token'
        ])
        && isEmailTokenDTO(value?.token)
    );
}

export function stringifyVerifyEmailTokenDTO (value: VerifyEmailTokenDTO): string {
    return `VerifyEmailTokenDTO(${value})`;
}

export function parseVerifyEmailTokenDTO (value: any): VerifyEmailTokenDTO | undefined {
    if ( isVerifyEmailTokenDTO(value) ) return value;
    return undefined;
}


