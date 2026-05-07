import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { run } from '../../lib/run';
import { print } from '../../lib/print';

/**
 * Demonstrates three different "stream started" moments for `streamText`:
 *
 * 1. `experimental_onStart` — pipeline begins after prompt standardization (not tied to consuming `fullStream`).
 * 2. `experimental_onLanguageModelCallStart` — immediately before the provider's `doStream`.
 * 3. `fullStream` part `{ type: 'start' }` — first chunk when a consumer reads the public stream.
 */
run(async () => {
  const result = streamText({
    model: openai('gpt-5-nano'),
    prompt: 'Say hello in one short sentence.',
    maxRetries: 0,
    experimental_onStart: event => {
      console.log('[experimental_onStart] streamText run started', {
        callId: event.callId,
        operationId: event.operationId,
        provider: event.provider,
        modelId: event.modelId,
      });
    },
    experimental_onLanguageModelCallStart: event => {
      console.log('[experimental_onLanguageModelCallStart] provider call starting', {
        callId: event.callId,
        provider: event.provider,
        modelId: event.modelId,
      });
    },
  });

  for await (const part of result.fullStream) {
    if (part.type === 'start') {
      console.log('[fullStream] first part is { type: "start" }', part);
      continue;
    }

    if (part.type === 'text-delta') {
      process.stdout.write(part.text);
    }
  }

  process.stdout.write('\n');
  print('Usage:', await result.usage);
  print('Finish reason:', await result.finishReason);
});
