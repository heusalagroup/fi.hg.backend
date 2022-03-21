# fi.hg.backend

Backend module


### EmailAuthController

You can use the `EmailAuthController` in your HTTP controller as follows:

```typescript
class BackendController {

    @PostMapping("/authenticateEmail")
    public static async authenticateEmail (
        @RequestBody
        body: ReadonlyJsonObject,
        @RequestParam(QueryParam.LANGUAGE, RequestParamValueType.STRING)
        langString = ""
    ): Promise<ResponseEntity< EmailTokenDTO | ErrorDTO >> {
        return EmailAuthController.authenticateEmail(body, langString);
    }

    @PostMapping("/verifyEmailToken")
    public static async verifyEmailToken (
        @RequestBody
        body: ReadonlyJsonObject
    ): Promise<ResponseEntity<EmailTokenDTO | ErrorDTO>> {
        return EmailAuthController.verifyEmailToken(body);
    }

    @PostMapping("/verifyEmailCode")
    public static async verifyEmailCode (
        @RequestBody
        body: ReadonlyJsonObject
    ): Promise<ResponseEntity< EmailTokenDTO | ErrorDTO >> {
        return EmailAuthController.verifyEmailCode(body);
    }

}
```

...and configure it in your main function:

```typescript
async function main () {
    
    EmailTokenService.setJwtEngine(
        JwtService.createJwtEngine(
            "secret-string",
            "HS256" as Algorithm
        )
    );

    EmailAuthController.setDefaultLanguage(Language.FINNISH);

    await BackendTranslationService.initialize(Language.FINNISH, {
        en: {
            "common.hello": "hello world"
        },
        fi: {
            "common.hello": "Moi maailma"
        }
    });

    EmailService.initialize("smtp://localhost:25");
    EmailService.setDefaultFrom("Example Inc <info@example.com>");

    // .. other handling, see our backend creator tool

}

```

See [@heusalagroup/create-backend](https://github.com/heusalagroup/create-backend) for how to use the backend controller.

This service also requires `nodemailer`, `i18n` and `jws` modules.
