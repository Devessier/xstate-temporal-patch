import { proxyActivities } from '@temporalio/workflow';
import { createMachine, interpret } from 'xstate';
import type * as activities from './activities';

const machine =
  /** @xstate-layout N4IgpgJg5mDOIC5QFVZgE4AIBmAbA9gO4B0A4mAC4UCWAdlJgK5roDksmd2+6AtgIY18tAMQRhYYnQBu+ANaTUGHARLkqdBswztOtbn0HVhCGfgDGR4QG0ADAF079xKAAO+WNSG0XIAB6IAMwATACcxADswcEAbIEArAAc8TExACwRMQA0IACeiACMwYHE8bYFaRkFthERBbVpAL6NOUpYeETEAELUuLiaTCxiElK0sgrEbSqdPX0D2uimYxZWtE5Ovu6e3r4BCKG24TGhabFFaQUF8Zk5+QjBacSBV6HxabYxtsWxH82tLNMSAB1fheAYGTC0MB+CiYcwAC346CgmhEflgFEEkn42AoGAAFAVMLxhBR4QBKERTDrA0E0eg4HiQ6GwhFIlH0DZIEBbMHCXaIRKZYgVRIfQJpQKfCKhRK3RDBRKPRXxYLxdWqiUxWp-EDU1TEADKYFoEAGYAEvUwFHwg2UhC88MwACNev0GVweAJvMMoaNxooATSjSazQyLaDcNbbQtMA6yS63QNPYZvEtZJZvOsHJsPHyfNy9gVAjViO9gocS2lEoFQgV5QgiiUyhUQurytq0vFmi0QLR8BA4L59URc9tjAXQEXgg2ALSJRIipVxAo12r1Ve6kdqSj0rQsXQp70Tsf5gUIT4N2Vl0IRKUZD62JW2QJboMG2bu-cYU87QuIGJV2IWw3kSK4IjSOJVSvRc0lve8IkfZ8ml7bdiBBMEGQhKEYThRFkU0X8T3-RtggieJiFiRJolCEIIIueIGwrGJgMlSDEjrS5yLfZRg2NU1zUtKMbTtLB4ydV05g9fQvVWIj+RIooXyeNVEnSdIDnqOdbGIGIFy4q53iKCI1JiHtGiAA */
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
          onDone: 'Sending email to user with billing information',
        },
      },

      'Waiting for next charging': {
        after: {
          '1 month': 'Billing user',
        },
      },

      'Sending email to user with billing information': {
        invoke: {
          src: 'Send email',
          onDone: 'Waiting for next charging',
        },
      },
    },

    initial: "Getting user's information",

    predictableActionArguments: true,
  });

const { getUserInformation, billUser, sendEmail } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 seconds',
});

export const workflowId = 'patching-workflows-vFinal';
// vFinal
export async function myWorkflow(): Promise<void> {
  const service = interpret(
    machine.withConfig({
      services: {
        "Get user's information": () => getUserInformation(),
        'Bill user': () => billUser(),
        'Send email': () => sendEmail(),
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
