import { proxyActivities, deprecatePatch } from '@temporalio/workflow';
import { createMachine, interpret } from 'xstate';
import type * as activities from './activities';

const machine =
  /** @xstate-layout N4IgpgJg5mDOIC5QFVZgE4AIBmAbA9gO4B0A4mAC4UCWAdlJgK5roDksmd2+6AtgIY18tAMQRhYYnQBu+ANaTUGHARLkqdBswztOtbn0HVhCGfgDGR4QG0ADAF079xKAAO+WNSG0XIAB6IAMwATACcxADswcEAbIEArAAc8TExACwRMQA0IACeiACMwYHE8bYFaRkFthERBbVpAL6NOUpYeETEAELUuLiaTCxiElK0sgrEbSqdPX0D2uimYxZWtE5Ovu6e3r4BCIkxicSBtqGJtvEZcZcFOfkIBcfxmakptsFp5aERTS0gUx0SAB1fheAYGTC0MB+CiYcwAC346CgmhEflgFEEkn42AoGAAFAVMLxhBR4QBKEQA1TEEFg+g4HiQ6GwhFIlH0DZIEBbMHCXaIRKZYgVc5xNKBGI1M53RDBRJpYjy+LBeJqlWBNIxWrNVosaYkADKYFoEAGYAEvUwFHwg2UhC88MwACNev0GVweAJvMMoaNxop9YDiMbTebLbhrbaFpgHWSXW6Bp7DN4lrJLN51g5Nh4+T5uXsCicIsRPsFTic0olAqFbnlCsVSuUJaqygVtWl4s0-rR8BA4L5qUQc9tjPnQIXgrKEABaRJHAoKmJFIUrquJXX-IM09Q0BkLXTJ71jkd5gUIKXTs6l76SjK2KUK2yBTdDkizd1aFinnYFxDLo4LirApni1BIp3rBBrzSW90giB9bCfX49WUYM6T3BgIShGE4URZFNB-E8-weYIIniJVDmiUIQh+NIQOncsYmIWwJS1RJawKeouz+N8QxNM0GQtUFIxtO0sDjJ1XTmD19C9VZCP5YiimfY5VQOLUYPKCJpxnWxiEORJOLqS5ylIg4Ym7RogA */
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
          onDone: {
            target: 'Sending email to user with billing information',
            actions: 'Deprecate my-change-id patch',
          },
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

export const workflowId = 'patching-workflows-v3';
// v3
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
      actions: {
        'Deprecate my-change-id patch': () => deprecatePatch('my-change-id'),
      },
    })
  ).start();

  await new Promise((resolve) => {
    service.onDone(resolve);
  });
}
