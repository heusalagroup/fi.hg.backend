// Copyright (c) 2021-2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { init as i18nInit, changeLanguage, Resource, TFunction } from "i18next";
import { Language } from "../core/types/Language";
import { ReadonlyJsonObject } from "../core/Json";
import { LogService } from "../core/LogService";
import { TranslationResourceObject } from "../core/types/TranslationResourceObject";
import { TranslatedObject } from "../core/types/TranslatedObject";
import { TranslationUtils } from "../core/TranslationUtils";
import { LogLevel } from "../core/types/LogLevel";
import { TranslationFunction } from "../core/types/TranslationFunction";

const LOG = LogService.createLogger('BackendTranslationService');

export class BackendTranslationService {

    public static setLogLevel (level: LogLevel) {
        LOG.setLogLevel(level);
    }

    public static async initialize (
        defaultLanguage : Language,
        resources       : TranslationResourceObject
    ) : Promise<void> {
        const languageResources : Resource = TranslationUtils.getConfig(resources);
        return await new Promise((resolve, reject) => {
            i18nInit(
                {
                    resources: languageResources,
                    lng: defaultLanguage,
                    interpolation: {
                        escapeValue: true
                    }
                }
            ).then(() => {
                resolve();
            }).catch(err => {
                LOG.error(`Error in init: `, err);
                reject(err);
            });
        });
    }

    public static async translateKeys (
        lang              : Language,
        keys              : string[],
        translationParams : ReadonlyJsonObject
    ): Promise<TranslatedObject> {
        const t: TranslationFunction = await changeLanguage(lang);
        return TranslationUtils.translateKeys(t, keys, translationParams);
    }

    public static async translateJob<T> (
        lang     : Language,
        callback : ((t: TranslationFunction) => T)
    ) : Promise<T> {
        const t: TranslationFunction = await changeLanguage(lang);
        return callback(t);
    }

}
