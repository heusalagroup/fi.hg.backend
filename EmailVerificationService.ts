// Copyright (c) 2021-2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { randomInt } from 'crypto';
import { find, remove } from "../core/modules/lodash";
import { LogService } from "../core/LogService";

const VERIFICATION_TIMEOUT : number = 5*60*1000;

interface InternalEmailCode {
    readonly code  : string;
    readonly email : string;
    timer : any | undefined;
}

const LOG = LogService.createLogger('EmailVerificationService');

export class EmailVerificationService {

    private static _codes : InternalEmailCode[] = [];

    public static verifyCode (
        email : string,
        code  : string
    ) : boolean {

        LOG.debug(`verifyCode: "${code}" for email "${email}" `);

        if (!email) return false;
        if (!code) return false;

        const itemMatcher = (item : InternalEmailCode) => {
            return item?.email === email && item?.code === code;
        };

        const item : InternalEmailCode | undefined = find(this._codes, itemMatcher);
        if (!item) return false;

        if (item?.timer) {
            clearTimeout(item.timer);
            item.timer = undefined;
        }

        remove(this._codes, itemMatcher);

        LOG.debug(`Verified & removed "${code}" for email "${email}"`);

        return true;

    }

    public static removeVerificationCode (
        email : string,
        code  : string
    ) {

        if (!email) throw new TypeError('email is required');
        if (!code) throw new TypeError('code is required');

        const itemMatcher = (item : InternalEmailCode) => {
            return item.email === email && item.code === code;
        };

        const item : InternalEmailCode | undefined = find(this._codes, itemMatcher);

        if (item) {

            if (item?.timer) {
                clearTimeout(item.timer);
                item.timer = undefined;
            }

            remove(this._codes, itemMatcher);

            LOG.debug(`Removed "${code}" for email "${email}"`);

        }

    }

    public static createVerificationCode (
        email: string
    ) : string {

        const code = `${randomInt(0, 9999)}`.padStart(4, "0");

        const timer = setTimeout(() => {
            EmailVerificationService.removeVerificationCode(email, code);
        }, VERIFICATION_TIMEOUT);

        remove(this._codes, (item: InternalEmailCode) => item.email === email);

        this._codes.push({
            email,
            code,
            timer
        });

        LOG.debug(`Added "${code}" for email "${email}"`)

        return code;

    }

}


