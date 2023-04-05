// Copyright (c) 2021-2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { Algorithm, decode as jwsDecode, sign as jwsSign, verify as jwsVerify } from "jws";
import { JwtEngine } from "./JwtEngine";
import { isReadonlyJsonAny, isReadonlyJsonObject, ReadonlyJsonObject } from "../core/Json";
import { isBoolean } from "../core/types/Boolean";
import { LogService } from "../core/LogService";
import { isString } from "../core/types/String";
import { LogLevel } from "../core/types/LogLevel";

const LOG = LogService.createLogger('JwtService');

export class JwtService {

    public static setLogLevel (level: LogLevel) {
        LOG.setLogLevel(level);
    }

    private _defaultAlgorithm: string;

    public constructor (
        defaultAlgorithm: string = 'HS256'
    ) {
        this._defaultAlgorithm = defaultAlgorithm;
    }

    public getDefaultAlgorithm (): string {
        return this._defaultAlgorithm;
    }

    public setDefaultAlgorithm (value: string) {
        this._defaultAlgorithm = value;
    }

    public static decodePayload (token: string) : ReadonlyJsonObject {
        const decoded = jwsDecode(token);
        LOG.debug(`decodePayload: Parsing decoded = `, decoded);
        const payload = decoded?.payload;
        return isReadonlyJsonObject(payload) ? payload : JSON.parse(payload);
    }

    public static decodePayloadAudience (token: string) : string {
        const payload = JwtService.decodePayload(token);
        const aud = payload?.aud;
        if (!isString(aud)) {
            LOG.debug(`payload: `, payload);
            throw new TypeError(`decodePayloadAudience: Payload "aud" not string: ` +  token);
        }
        return aud;
    }

    public static decodePayloadSubject (token: string) : string {
        const payload = JwtService.decodePayload(token);
        const sub = payload?.sub;
        if (!isString(sub)) {
            LOG.debug(`payload: `, payload);
            throw new TypeError(`decodePayloadSubject: Payload "sub" not string: ` +  token);
        }
        return sub;
    }

    public static decodePayloadVerified (token: string) : boolean {
        const payload = JwtService.decodePayload(token);
        const verified = payload?.verified;
        if (!isBoolean(verified)) {
            LOG.debug(`payload: `, payload);
            throw new TypeError(`decodePayloadVerified: Payload "verified" not boolean: ` +  token);
        }
        return verified;
    }

    /**
     * Creates a jwt engine which hides secret
     *
     * @param secret
     * @param defaultAlgorithm
     */
    public createJwtEngine (
        secret: string,
        defaultAlgorithm ?: string
    ): JwtEngine {
        let _defaultAlgorithm: string | undefined = defaultAlgorithm;
        return {
            getDefaultAlgorithm: (): string => _defaultAlgorithm ?? this.getDefaultAlgorithm(),
            setDefaultAlgorithm: (value: string): void => {
                _defaultAlgorithm = value;
            },
            sign: (
                payload: ReadonlyJsonObject,
                alg?: string
            ): string =>
                jwsSign(
                    {
                        header: {alg: (alg ?? this.getDefaultAlgorithm()) as unknown as Algorithm},
                        payload: payload,
                        secret: secret
                    }
                ),
            verify: (
                token: string,
                alg?: string
            ): boolean => jwsVerify(token, (alg ?? _defaultAlgorithm ?? this.getDefaultAlgorithm()) as unknown as Algorithm, secret)
        };
    }

}
