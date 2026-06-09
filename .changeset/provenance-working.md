---
'adonisjs-mongoose': patch
---

Releases now ship with a working npm provenance attestation (the CI publish
writes the `provenance` setting to the npmrc that `pnpm publish` actually
reads). Verify with `npm audit signatures`.
