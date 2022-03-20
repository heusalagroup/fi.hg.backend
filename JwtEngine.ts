// Copyright (c) 2021-2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { Algorithm } from "jws";
import { ReadonlyJsonObject } from "../core/Json";

export interface JwtEngine {
    getDefaultAlgorithm () : Algorithm;
    setDefaultAlgorithm (value: Algorithm) : void;
    sign(payload: ReadonlyJsonObject, alg?: Algorithm) : string;
    verify(token: string, alg: Algorithm) : boolean;
}

