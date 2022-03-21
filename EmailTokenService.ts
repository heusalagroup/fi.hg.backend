// Copyright (c) 2021-2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { Algorithm } from 'jws';
import { EmailTokenDTO } from "../auth/email/types/EmailTokenDTO";
import { LogService } from "../core/LogService";
import { JwtEngine } from "./JwtEngine";
import { JwtService } from "./JwtService";

const UNVERIFIED_JWT_TOKEN_EXPIRATION_MINUTES = 5;
const VERIFIED_JWT_TOKEN_EXPIRATION_DAYS = 365;

const LOG = LogService.createLogger('EmailTokenService');

export class EmailTokenService {

    private static _jwtEngine: JwtEngine | undefined;

    public static setJwtEngine (value: JwtEngine) {
        EmailTokenService._jwtEngine = value;
    }

    public static getTokenAudience (token: string): string | undefined {
        try {
            return JwtService.decodePayloadAudience(token);
        } catch (err) {
            LOG.error(`getTokenAudience: Error: `, err);
            return undefined;
        }
    }

    public static getTokenSubject (token: string): string | undefined {
        try {
            return JwtService.decodePayloadSubject(token);
        } catch (err) {
            LOG.error(`getTokenSubject: Error: `, err);
            return undefined;
        }
    }

    public static verifyToken (
        email: string,
        token: string,
        requireVerifiedToken: boolean,
        alg                  ?: Algorithm
    ): boolean {

        try {

            LOG.debug(`verifyToken: email "${email}", "${token}", ${requireVerifiedToken}`);

            if ( !email ) {
                LOG.debug(`verifyToken: No email provided: `, email);
                return false;
            }

            if ( !token ) {
                LOG.debug(`verifyToken: No token provided: `, token);
                return false;
            }

            if ( !EmailTokenService._jwtEngine.verify(token, alg) ) {
                LOG.debug(`verifyToken: Token was invalid: `, token);
                return false;
            }

            const payload = JwtService.decodePayload(token);

            if ( requireVerifiedToken ) {

                if ( payload?.sub !== email ) {
                    LOG.debug(`verifyToken: "sub" did not match: `, payload?.sub, email);
                    return false;
                }

            } else {

                if ( payload?.aud !== email ) {
                    LOG.debug(`verifyToken: "aud" did not match: `, payload?.aud, email);
                    return false;
                }

            }

            LOG.debug(`verifyToken: Success: `, payload);

            return true;

        } catch (err) {
            LOG.error(`verifyToken: Could not verify token: `, err, token, email, requireVerifiedToken);
            return false;
        }

    }

    public static verifyTokenOnly (
        token: string,
        requireVerifiedToken: boolean,
        alg                  ?: Algorithm
    ): boolean {

        try {

            LOG.debug(`verifyTokenOnly: "${token}", ${requireVerifiedToken}`);

            if ( !token ) {
                LOG.debug(`verifyTokenOnly: No token provided: `, token);
                return false;
            }

            if ( !EmailTokenService._jwtEngine.verify(token, alg) ) {
                LOG.debug(`verifyTokenOnly: Token was invalid: `, token);
                return false;
            }

            const payload = JwtService.decodePayload(token);

            if ( requireVerifiedToken ) {

                if ( !payload?.sub ) {
                    LOG.debug(`verifyTokenOnly: Property "sub" did not exists`, payload?.sub);
                    return false;
                }

            } else {

                if ( !payload?.aud ) {
                    LOG.debug(`verifyTokenOnly: Property "aud" did not exist: `, payload?.aud);
                    return false;
                }

            }

            LOG.debug(`verifyTokenOnly: Success: `, payload);

            return true;

        } catch (err) {
            LOG.error(`verifyTokenOnly: Could not verify token: `, err, token, requireVerifiedToken);
            return false;
        }

    }

    public static createUnverifiedEmailToken (
        email: string,
        alg                  ?: Algorithm
    ): EmailTokenDTO {

        try {

            const signature = EmailTokenService._jwtEngine.sign(
                {
                    exp: Math.floor(Date.now() / 1000 + UNVERIFIED_JWT_TOKEN_EXPIRATION_MINUTES * 60),
                    aud: email
                },
                alg
            );

            return {
                token: signature,
                email
            };

        } catch (err) {
            LOG.error(`createUnverifiedEmailToken: "${email}": Could not sign JWT: `, err);
            throw new TypeError(`Could not sign JWT for "${email}"`);
        }

    }

    public static createVerifiedEmailToken (
        email: string,
        alg ?: Algorithm
    ): EmailTokenDTO {
        try {
            const signature = EmailTokenService._jwtEngine.sign(
                {
                    exp: Math.floor(Date.now() / 1000 + VERIFIED_JWT_TOKEN_EXPIRATION_DAYS * 24 * 60 * 60),
                    sub: email
                },
                alg
            );
            return {
                token: signature,
                email,
                verified: true
            };
        } catch (err) {
            LOG.error(`createVerifiedEmailToken: "${email}": Could not sign JWT: `, err);
            throw new TypeError(`Could not sign JWT for "${email}"`);
        }
    }

}
