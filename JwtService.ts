// Copyright (c) 2021-2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { Algorithm, decode as jwsDecode, sign as jwsSign, verify as jwsVerify } from "jws";
import { JwtEngine } from "./JwtEngine";
import { ReadonlyJsonObject } from "../core/Json";
import { isString } from "../core/modules/lodash";

export class JwtService {

    private static _defaultAlgorithm: string = 'HS256';

    public static getDefaultAlgorithm (): string {
        return JwtService._defaultAlgorithm;
    }

    public static setDefaultAlgorithm (value: string) {
        JwtService._defaultAlgorithm = value;
    }

    public static decodePayload (token: string) : ReadonlyJsonObject {
        const decoded = jwsDecode(token);
        return JSON.parse(decoded?.payload);
    }

    public static decodePayloadAudience (token: string) : string {
        const payload = JwtService.decodePayload(token);
        const aud = payload?.aud;
        if (!isString(aud)) throw new TypeError(`getTokenAudience: Payload "aud" not string: ` +  token);
        return aud;
    }

    public static decodePayloadSubject (token: string) : string {
        const payload = JwtService.decodePayload(token);
        const sub = payload?.sub;
        if (!isString(sub)) throw new TypeError(`getTokenAudience: Payload "sub" not string: ` +  token);
        return sub;
    }

    public static createJwtEngine (
        secret: string,
        defaultAlgorithm ?: string
    ): JwtEngine {
        let _defaultAlgorithm: string | undefined = defaultAlgorithm;
        return {
            getDefaultAlgorithm: (): string => {
                return _defaultAlgorithm ?? JwtService.getDefaultAlgorithm();
            },
            setDefaultAlgorithm: (value: string): void => {
                _defaultAlgorithm = value;
            },
            sign: (
                payload: ReadonlyJsonObject,
                alg?: string
            ): string => {
                return jwsSign(
                    {
                        header: {alg: (alg ?? JwtService.getDefaultAlgorithm()) as unknown as Algorithm},
                        payload: payload,
                        secret: secret
                    }
                );
            },
            verify: (token: string, alg?: string): boolean => {
                return jwsVerify(token, (alg ?? _defaultAlgorithm ?? JwtService.getDefaultAlgorithm()) as unknown as Algorithm, secret);
            }
        };
    }

}
