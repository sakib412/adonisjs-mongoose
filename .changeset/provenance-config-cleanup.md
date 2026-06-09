---
'adonisjs-mongoose': patch
---

Drop `publishConfig.provenance`. Provenance is now driven by the CI workflow
(`NPM_CONFIG_PROVENANCE`), so publishing locally no longer fails for lack of
an OIDC token while CI publishes still carry a provenance attestation.
