# Patching with XState + Temporal

Adapted from https://github.com/temporalio/samples-typescript/tree/main/patching-api

We have a base workflow (`src/workflows-v1.ts`), that charges a user every month.

After the workflow is alive, we want to update it to email the user after charging. We use a `patch` to do that. See `src/workflows-v2.ts`. It will make workflows created before the patch send the email, and workflows created after the patch is released will directly send emails.

When workflows that were started before the patch are all terminated, we can deprecate the patch with `deprecatePatch`. See `src/workflows-v3.ts`.

Once all workflows that were run with the patch are terminated, we can remove the call to `deprecatePatch`, and we end up with the final code. See `src/workflows-vFinal.ts`.
