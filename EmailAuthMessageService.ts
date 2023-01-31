// Copyright (c) 2022. <info@heusalagroup.fi>. All rights reserved.

import { Language } from "../core/types/Language";
import { BackendTranslationService } from "./BackendTranslationService";
import {
    T_M_AUTH_CODE_BODY_HTML,
    T_M_AUTH_CODE_BODY_TEXT,
    T_M_AUTH_CODE_FOOTER_HTML,
    T_M_AUTH_CODE_FOOTER_TEXT,
    T_M_AUTH_CODE_HEADER_HTML,
    T_M_AUTH_CODE_HEADER_TEXT,
    T_M_AUTH_CODE_SUBJECT
} from "../core/auth/email/translation";
import {
    EmailMessage,
    EmailService
} from "./EmailService";
import { LogService } from "../core/LogService";
import { LogLevel } from "../core/types/LogLevel";

const LOG = LogService.createLogger('EmailAuthMessageService');

export class EmailAuthMessageService {

    public static setLogLevel (level: LogLevel) {
        LOG.setLogLevel(level);
    }

    private readonly _emailService : EmailService;

    /**
     *
     * @param emailService
     */
    public constructor (
        emailService: EmailService
    ) {
        this._emailService = emailService;
    }

    public async sendAuthenticationCode (
        lang: Language,
        email: string,
        code: string
    ): Promise<void> {

        const translationParams = {
            CODE: code
        };

        const translations = await BackendTranslationService.translateKeys(
            lang,
            [
                T_M_AUTH_CODE_SUBJECT,
                T_M_AUTH_CODE_HEADER_TEXT,
                T_M_AUTH_CODE_BODY_TEXT,
                T_M_AUTH_CODE_FOOTER_TEXT,
                T_M_AUTH_CODE_HEADER_HTML,
                T_M_AUTH_CODE_BODY_HTML,
                T_M_AUTH_CODE_FOOTER_HTML
            ],
            translationParams
        );

        const subject: string = translations[T_M_AUTH_CODE_SUBJECT];
        const contentText: string = translations[T_M_AUTH_CODE_HEADER_TEXT] + translations[T_M_AUTH_CODE_BODY_TEXT] + translations[T_M_AUTH_CODE_FOOTER_TEXT];
        const contentHtml: string = translations[T_M_AUTH_CODE_HEADER_HTML] + translations[T_M_AUTH_CODE_BODY_HTML] + translations[T_M_AUTH_CODE_FOOTER_HTML];

        await this._emailService.sendEmailMessage(
            {
                to: email,
                subject,
                content: contentText,
                htmlContent: contentHtml
            } as EmailMessage
        );

        LOG.info(`sendAuthenticationCode: Sent successfully to ${email}`);

    }

}
