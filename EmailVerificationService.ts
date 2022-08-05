// Copyright (c) 2021-2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { randomInt } from 'crypto';
import { filter, find, forEach, map, remove } from "../core/modules/lodash";
import { LogService } from "../core/LogService";
import { clearTimeout } from "timers";

const DEFAULT_VERIFICATION_TIMEOUT : number = 5*60*1000;

interface InternalEmailCode {
    readonly code  : string;
    readonly email : string;
    timer : any | undefined;
}

const LOG = LogService.createLogger('EmailVerificationService');

export class EmailVerificationService {

    private _codes : InternalEmailCode[];
    private readonly _verificationTimeout : number;

    public constructor (
        verificationTimeout : number = DEFAULT_VERIFICATION_TIMEOUT
    ) {
        this._codes = [];
        this._verificationTimeout = verificationTimeout;
    }

    public destroy () {
        forEach(
            this._codes,
            (item: InternalEmailCode) => {
                try {
                    const timer = item?.timer;
                    if (timer !== undefined) {
                        clearTimeout(timer);
                        item.timer = undefined;
                    }
                } catch (err) {
                    LOG.error(`Could not remove timer: `, err);
                }
            }
        );
        this._codes = [];
    }

    public verifyCode (
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

    public removeVerificationCode (
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

    public createVerificationCode (
        email: string
    ) : string {
        const code = `${randomInt(0, 9999)}`.padStart(4, "0");
        const timer = setTimeout(() => {
            this.removeVerificationCode(email, code);
        }, this._verificationTimeout);
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
