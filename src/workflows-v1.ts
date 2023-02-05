import { proxyActivities } from '@temporalio/workflow';
import { createMachine, interpret } from 'xstate';
import type * as activities from './activities';

const machine =
  /** @xstate-layout N4IgpgJg5mDOIC5QFVZgE4AIBmAbA9gO4B0A4mAC4UCWAdlJgK5roDksmd2+6AtgIY18tAMQRhYYnQBu+ANaTUGHARLkqdBswztOtbn0HVhCGfgDGR4QG0ADAF079xKAAO+WNSG0XIAB6IAMwATACcxADswcEAbIEArAAc8TExACwRMQA0IACeiACMwYHE8bYFaRkFthERBbVpAL6NOUpYeETEAELUuLiaTCxiElK0sgrEbSqdPX0D2uimYxZWtE5Ovu6e3r4BCImpxIm2tjFlgTGhaaHROfkIRSVlFRnxaTEHEaExza0s0yQAOr8LwDAyYWhgPwUTDmAAW-HQUE0Ij8sAogkk-GwFAwAAoCpheMIKHCAJQiKYdIEgmj0HA8CFQmHwxHI+gbJAgLag4S7RCJTLECrHOJpC41UKJO6IaIxYgXNIVQIFS61WyhZotEC0fAQOC+KmqTYeXk+Ll7Ioyh4FYihe0O0IVN4JeIFX4gI2ddR0rQsXRcHgCHZcnkh0B7GK2a1S4jXCKKiKnWyJNK2QIer0kWb9ekLE3bYzmiOIGIFRLEWxvRIFeIRd4JYIxivxxPJ1O2JrarPEYGg+ngyHQ2EIpGaAtm-kPFMlFVJ+JlNNuxJNvKFYK2+0XN1lmvlcpaxpAA */
  createMachine({
    id: 'User flow',

    states: {
      "Getting user's information": {
        invoke: {
          src: "Get user's information",
          onDone: 'Billing user',
        },
      },

      'Billing user': {
        invoke: {
          src: 'Bill user',
          onDone: 'Waiting for next charging',
        },
      },

      'Waiting for next charging': {
        after: {
          '1 month': 'Billing user',
        },
      },
    },

    initial: "Getting user's information",

    predictableActionArguments: true,
  });

const { getUserInformation, billUser } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 seconds',
});

export const workflowId = 'patching-workflows-v1';
// v1
export async function myWorkflow(): Promise<void> {
  const service = interpret(
    machine.withConfig({
      services: {
        "Get user's information": () => getUserInformation(),
        'Bill user': () => billUser(),
      },
      delays: {
        '1 month': 10_000, // 1 month is 10 seconds
      },
    })
  ).start();

  await new Promise((resolve) => {
    service.onDone(resolve);
  });
}
