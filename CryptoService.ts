// Copyright (c) 2021-2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { randomInt } from "crypto";

export class CryptoService {

    /**
     * Creates random string containing numbers between 0 and 9.
     *
     * Eg. `size=2` gives values between 0 and 99.
     * Eg. `size=4` gives values between 0 and 9999.
     *
     * @param size
     */
    public static createRandomInteger (
        size: number
    ) : number {

        if (size <= 0) {
            throw new TypeError(`CryptoService.createRandomNumberString: size must be over 0: ${size} provided`);
        }

        return randomInt(0, Math.pow(10, size)-1 );

    }

    /**
     * Creates random string containing numbers between 0 and 9.
     *
     * Eg. `size=2` gives values between "00" and "99".
     * Eg. `size=4` gives values between "0000" and "9999".
     *
     * @param size
     */
    public static createRandomIntegerString (
        size: number
    ) : string {
        return `${CryptoService.createRandomInteger(size)}`.padStart(size, "0");
    }

}

