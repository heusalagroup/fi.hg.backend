# fi.hg.backend

Backend module

### Install the module

```shell
npm i '@types/lodash' lodash
hgm i fi.hg.core
hgm i fi.hg.backend
```

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

See [hg-email-auth](https://github.com/heusalagroup/hg-email-auth) for how to use the service.

#### Installation

This service depends on `nodemailer`, `i18next` and `jws` modules as well as [hgm's](https://github.com/heusalagroup/hgm) submodule [fi.hg.auth.email](https://github.com/heusalagroup/fi.hg.auth.email):

```shell
npm i '@types/i18next' i18next
npm i '@types/nodemailer' nodemailer
npm i '@types/jws' jws
hgm i fi.hg.auth.email
```

See also [@heusalagroup/create-backend](https://github.com/heusalagroup/create-backend) for how to initialize your own backend project.

