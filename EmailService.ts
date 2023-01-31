// Copyright (c) 2021-2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { createTransport } from 'nodemailer';
import { uniq } from "../core/functions/uniq";
import { trim } from "../core/functions/trim";
import { LogService } from "../core/LogService";
import { isArray } from "../core/types/Array";
import { LogLevel } from "../core/types/LogLevel";

const LOG = LogService.createLogger('EmailService');

export interface EmailMessage {
    readonly from        ?: string;
    readonly to           : string | string[];
    readonly cc          ?: string | string[];
    readonly subject      : string;
    readonly content     ?: string;
    readonly htmlContent ?: string;
}

export class EmailService {

    public static setLogLevel (level: LogLevel) {
        LOG.setLogLevel(level);
    }

    private _from        : string | undefined;
    private _transporter : any | undefined;

    /**
     *
     * @param from
     * @param transporter
     */
    public constructor (
        from         : string,
        transporter ?: any | undefined
    ) {
        this._from = from;
        this._transporter = transporter;
    }

    public setDefaultFrom (from: string) {
        this._from = from;
        LOG.info(`Default from address defined as `, this._from);
    }

    public initialize ( config  ?: string ) {

        config = trim(config ?? '');

        if (config === '') {
            LOG.debug(`No config defined. Using localhost:25.`);
            this._transporter = createTransport({
                host: 'localhost',
                port: 25,
                secure: false
            });
            return;
        }

        const u = new URL(config);

        const username : string | undefined = u?.username || undefined;
        const password : string | undefined = u?.password || undefined;
        const hostname : string  = u?.hostname || 'localhost';
        const port     : number  = parseInt(u?.port || '25', 10);
        const secure   : boolean = u?.searchParams?.has('secure') ?? false;

        if ( username && password ) {

            LOG.debug(`Config "${config}" parsed as ${hostname}:${port} with ${username}:${password} with secure as ${secure}`)
            this._transporter = createTransport({
                host: hostname,
                port: port,
                secure: secure,
                auth: {
                    user: decodeURIComponent(username),
                    pass: decodeURIComponent(password)
                }
            });

        } else {

            LOG.debug(`Config "${config}" parsed as ${hostname}:${port} without auth with secure as ${secure}`)
            this._transporter = createTransport({
                host: hostname,
                port: port,
                secure: secure
            });

        }

    }

    public async sendEmailMessage (message: EmailMessage) {

        const to : string[] | string = message?.to;
        const cc : string[] | string = message?.cc ?? [];

        const toList : string[] = isArray(to) ? to : [to];
        const ccList : string[] = isArray(cc) ? cc : [cc];

        const recipientList : string[] = uniq([
            ...toList,
            ...ccList
        ]);

        const from    : string = message?.from ?? this._from ?? '';
        if (!from) throw new TypeError('"from" must be defined');
        const recipientString : string = recipientList.join(', ');
        const subject : string = message?.subject ?? '';

        const content : string = message?.content ?? '';

        const contentHtml : string = message?.htmlContent ?? content;

        LOG.debug(`Sending message "${subject}" to "${recipientString}" from "${from}"`);

        await this._transporter.sendMail({
            from    : from,
            to      : recipientString,
            subject : subject,
            text    : content,
            html    : contentHtml,
        });

    }

}
