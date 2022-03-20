// Copyright (c) 2021-2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { Algorithm, decode as jwsDecode, sign as jwsSign, verify as jwsVerify } from "jws";
import { JwtEngine } from "./JwtEngine";
import { ReadonlyJsonObject } from "../core/Json";
import { isString } from "../core/modules/lodash";

export class JwtService {

    private static _defaultAlgorithm: Algorithm = 'HS256';

    public static getDefaultAlgorithm (): Algorithm {
        return JwtService._defaultAlgorithm;
    }

    public static setDefaultAlgorithm (value: Algorithm) {
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
        defaultAlgorithm ?: Algorithm
    ): JwtEngine {
        let _defaultAlgorithm: Algorithm | undefined = defaultAlgorithm;
        return {
            getDefaultAlgorithm: (): Algorithm => {
                return _defaultAlgorithm ?? JwtService.getDefaultAlgorithm();
            },
            setDefaultAlgorithm: (value: Algorithm): void => {
                _defaultAlgorithm = value;
            },
            sign: (
                payload: ReadonlyJsonObject,
                alg?: Algorithm
            ): string => {
                return jwsSign(
                    {
                        header: {alg: alg ?? JwtService.getDefaultAlgorithm()},
                        payload: payload,
                        secret: secret
                    }
                );
            },
            verify: (token: string, alg?: Algorithm): boolean => {
                return jwsVerify(token, alg ?? _defaultAlgorithm ?? JwtService.getDefaultAlgorithm(), secret);
            }
        };
    }

}
