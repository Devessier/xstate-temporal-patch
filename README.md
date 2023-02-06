# Patching with XState + Temporal

Adapted from https://github.com/temporalio/samples-typescript/tree/main/patching-api

Watch to understand workflows versioning with Temporal: https://www.youtube.com/watch?v=kkP899WxgzY&ab_channel=Temporal

## How it works

We have a base workflow ([`src/workflows-v1.ts`](src/workflows-v1.ts)), that charges a user every month.

After the workflow is alive, we want to update it to email the user after charging. We use a `patch` to do that. See [`src/workflows-v2.ts`](src/workflows-v2.ts). We create a new branch with a guard inside the machine, to represent the new path we want, while keeping the old one. It will make workflows created before the patch send the email from now, and workflows created after the patch is released will directly send emails.

When workflows that were started before the patch are all terminated, we can deprecate the patch with `deprecatePatch`. See [`src/workflows-v3.ts`](src/workflows-v3.ts). `deprecatePatch` must be called where we were calling `patch`. If `patch` was in a guard, we must remove the guard and replace it with an action calling `deprecatePatch`.

Once all workflows that were run with the patch are terminated, we can remove the call to `deprecatePatch`, and we end up with the final code. See [`src/workflows-vFinal.ts`](src/workflows-vFinal.ts).

## How to test?

Follow steps listed there: https://github.com/temporalio/samples-typescript/tree/main/patching-api#running-this-sample

Basically, we are going to simulate that we update the workflow in production, step by step. We are going to see what's the behavior for workflows started at each step.
