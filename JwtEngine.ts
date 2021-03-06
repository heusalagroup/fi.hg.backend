// Copyright (c) 2021-2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { ReadonlyJsonObject } from "../core/Json";

export interface JwtEngine {
    getDefaultAlgorithm () : string;
    setDefaultAlgorithm (value: string) : void;
    sign(payload: ReadonlyJsonObject, alg?: string) : string;
    verify(token: string, alg: string) : boolean;
}

