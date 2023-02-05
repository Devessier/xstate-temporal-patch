import { proxyActivities, patched } from '@temporalio/workflow';
import { createMachine, interpret } from 'xstate';
import type * as activities from './activities';

const machine =
  /** @xstate-layout N4IgpgJg5mDOIC5QFVZgE4AIBmAbA9gO4B0A4mAC4UCWAdlJgK5roDksmd2+6AtgIY18tAMQRhYYnQBu+ANaTUGHARLkqdBswztOtbn0HVhCGfgDGR4QG0ADAF079xKAAO+WNSG0XIAB6IAMwATACcxADswcEAbIEArAAc8TExACwRMQA0IACeiACMwYHE8bYFaRkFthERBbVpAL6NOUpYeETEAELUuLiaTCxiElK0sgrEbSqdPX0D2uimYxZWtE5Ovu6e3r4BCIm2icTBafFhBaERadVp2XmIJ8SBBfGh8fGBMYmhN4nNrSxpiQAOr8LwDAyYWhgPwUTDmAAW-HQUE0Ij8sAogkk-GwFAwAAoCpheMIKAiAJQiKYdEFgmj0HA8KEwuGI5Go+gbJAgLbg4S7RCJTLECoHOJpT41UKJHL5BDBRJpY7JYLvd7FW61f4gGmqbq9fqMhbDaGjcaKQG0g1zY0sJaySzedYFZw8vk7Hl7A7hUK2f0hQ6BWqhQJywrFUrla6JRIxWIRJUxHV6zoAZTAtAgAzAAl6mAo+EGykIXgRmAARoaBlweAJvKbJGYJqmSBmszm87gC0WFphS+TK9XGbXDN4HStnQ5uW4PPyfF7CoEasQ0rZgrZQ7Y0olAj9wwgiiUyhUQu9yjErvFmi0QLR8BA4L5W5s557QHsigeALSx0VJj44yVH5ggKFMrX1dQGS0FhdFHetjAXWdtkQwUEBiWwDxlVdLk+DJbAwpVbECcDlGtWYjRgjBXxQgVF3QgojlseIdxeK44jOLCjjSXD0giAjDjXJpb1bYhQXBRlIWhWF4SRFFNBo+c0KKCJ4mOL5olDYIrmueIDw3GJiG3QJbm+ApzNU0j2n1dts0ZXMwW7QtiywAdyyrW0GHg1ZFPffwI2Ip41TjW4ePKCIf1sYgvkSCyXjXFS42TG8gA */
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
          onDone: [
            {
              target: 'Sending email to user with billing information',
              cond: 'Is my-change-id patch',
            },
            'Waiting for next charging',
          ],
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

export const workflowId = 'patching-workflows-v2';
// v2
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
      guards: {
        'Is my-change-id patch': () => patched('my-change-id') === true,
      },
    })
  ).start();

  await new Promise((resolve) => {
    service.onDone(resolve);
  });
}
