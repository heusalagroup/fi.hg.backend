// Copyright (c) 2022. <info@heusalagroup.fi>. All rights reserved.
//

import { ReadonlyJsonObject } from "../core/Json";
import { ResponseEntity } from "../core/request/ResponseEntity";
import { createErrorDTO, ErrorDTO } from "../core/types/ErrorDTO";
import { Language, parseLanguage } from "../core/types/Language";
import { isAuthenticateEmailDTO } from "../auth/email/types/AuthenticateEmailDTO";
import { EmailVerificationService } from "./EmailVerificationService";
import { EmailTokenService } from "./EmailTokenService";
import { LogService } from "../core/LogService";
import { EmailAuthMessageService } from "./EmailAuthMessageService";
import { isString } from "../core/modules/lodash";
import { isVerifyEmailTokenDTO } from "../auth/email/types/VerifyEmailTokenDTO";
import { isVerifyEmailCodeDTO } from "../auth/email/types/VerifyEmailCodeDTO";
import { EmailTokenDTO } from "../auth/email/types/EmailTokenDTO";

const LOG = LogService.createLogger('EmailAuthController');

/**
 * This HTTP backend controller can be used to validate the ownership of user's
 * email address.
 *
 *  1. Call .authenticateEmail(body, lang) to send the authentication email
 *  2. Call .verifyEmailCode(body) to verify user supplied code from the email and create a session JWT
 *  3. Call .verifyEmailToken(body) to verify validity of the previously created session JWT and to refresh the session
 *
 * The .verifyTokenAndReturnSubject(token) can be used to validate internally API calls in your own APIs.
 */
export class EmailAuthController {

    private static _defaultLanguage: Language = Language.ENGLISH;

    /**
     * Set default language for messages sent to the user by email.
     * @param value
     */
    public static setDefaultLanguage (value: Language) {
        this._defaultLanguage = value;
    }

    /**
     * Handles POST HTTP request to initiate an email address authentication by
     * sending one time code to the user as a email message.
     *
     * The message should be in format `AuthenticateEmailDTO`.
     *
     * @param body {AuthenticateEmailDTO}
     * @param langString {Language} The optional language of the message
     */
    public static async authenticateEmail (
        body: ReadonlyJsonObject,
        langString: string = ""
    ): Promise<ResponseEntity<EmailTokenDTO | ErrorDTO>> {

        try {

            const lang: Language = parseLanguage(langString) ?? this._defaultLanguage;

            if ( !isAuthenticateEmailDTO(body) ) {
                return ResponseEntity.badRequest<ErrorDTO>().body(
                    createErrorDTO(`Body not AuthenticateEmailDTO`, 400)
                ).status(400);
            }

            LOG.debug('authenticateEmail: body = ', body);
            const email = body.email;
            if ( !email ) {
                return ResponseEntity.badRequest<ErrorDTO>().body(
                    createErrorDTO(`body.email required`, 400)
                ).status(400);
            }

            const code: string = EmailVerificationService.createVerificationCode(email);
            const emailToken: EmailTokenDTO = EmailTokenService.createUnverifiedEmailToken(email);

            try {
                await EmailAuthMessageService.sendAuthenticationCode(lang, email, code);
            } catch (err) {
                LOG.error(`authenticateEmail: Could not send email: `, err);
                return ResponseEntity.internalServerError<ErrorDTO>().body(
                    createErrorDTO('Internal error', 500)
                ).status(500);
            }

            return ResponseEntity.ok<EmailTokenDTO>(emailToken);

        } catch (err) {
            LOG.error(`ERROR: `, err);
            return ResponseEntity.internalServerError<ErrorDTO>().body(
                createErrorDTO('Internal Server Error', 500)
            ).status(500);
        }

    }

    /**
     * Handles HTTP POST request which validates the user supplied code and
     * generates a valid JWT token, which can be used to keep the session active.
     *
     * @param body {VerifyEmailCodeDTO}
     */
    public static async verifyEmailCode (
        body: ReadonlyJsonObject
    ): Promise<ResponseEntity<EmailTokenDTO | ErrorDTO>> {

        try {

            if ( !isVerifyEmailCodeDTO(body) ) {
                return ResponseEntity.badRequest<ErrorDTO>().body(
                    createErrorDTO(`Body not VerifyEmailCodeDTO`, 400)
                ).status(400);
            }
            LOG.debug('verifyEmailCode: body = ', body);

            const tokenDto: EmailTokenDTO = body?.token;
            const token: string = tokenDto?.token;
            const email: string = tokenDto?.email;
            const code: string = body?.code;

            if ( !(email && code && EmailVerificationService.verifyCode(email, code)) ) {
                return ResponseEntity.internalServerError<ErrorDTO>().body(
                    createErrorDTO('Access denied', 403)
                ).status(403);
            }

            if ( !(token && email && EmailTokenService.verifyToken(email, token, false)) ) {
                return ResponseEntity.internalServerError<ErrorDTO>().body(
                    createErrorDTO('Access denied', 403)
                ).status(403);
            }

            const emailToken: EmailTokenDTO = EmailTokenService.createVerifiedEmailToken(email);

            return ResponseEntity.ok<EmailTokenDTO>(emailToken);

        } catch (err) {
            LOG.error(`ERROR: `, err);
            return ResponseEntity.internalServerError<ErrorDTO>().body(
                createErrorDTO('Internal Server Error', 500)
            ).status(500);
        }

    }

    /**
     * Handles HTTP POST request which validates previously validated session and
     * if valid, generates a new refreshed session token.
     *
     * @param body {VerifyEmailTokenDTO}
     */
    public static async verifyEmailToken (
        body: ReadonlyJsonObject
    ): Promise<ResponseEntity<EmailTokenDTO | ErrorDTO>> {

        try {

            if ( !isVerifyEmailTokenDTO(body) ) {
                return ResponseEntity.badRequest<ErrorDTO>().body(
                    createErrorDTO(`Body not VerifyEmailTokenDTO`, 400)
                ).status(400);
            }

            LOG.debug('verifyEmailToken: body = ', body);
            const token: string = body?.token?.token ?? '';
            const email: string = body?.token?.email ?? '';

            if ( !(token && email && EmailTokenService.verifyToken(email, token, true)) ) {
                return ResponseEntity.badRequest<ErrorDTO>().body(
                    createErrorDTO('Access denied', 403)
                ).status(403);
            }

            const emailToken: EmailTokenDTO = EmailTokenService.createVerifiedEmailToken(email);

            return ResponseEntity.ok<EmailTokenDTO>(emailToken);

        } catch (err) {
            LOG.error(`ERROR: `, err);
            return ResponseEntity.internalServerError<ErrorDTO>().body(
                createErrorDTO('Internal Server Error', 500)
            ).status(500);
        }

    }

    /**
     * Can be used internally in APIs to validate and return the subject of this token.
     */
    public static async verifyTokenAndReturnSubject (
        token: string
    ): Promise<string> {
        LOG.debug('verifyTokenAndReturnSubject: token = ', token);
        if ( !isString(token) ) throw new TypeError('Argument must be string');
        if ( !EmailTokenService.isTokenValid(token) ) {
            throw new TypeError('Token was invalid: ' + token);
        }
        if ( !EmailTokenService.isTokenVerified(token) ) {
            throw new TypeError('Token was not verified: ' + token);
        }
        return EmailTokenService.getTokenSubject(token);
    }

}
