import { onError } from '@apollo/client/link/error';
import eventBus from './EventBus';

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => {
      // only suppress "already exists"
      if (/already\s+exists/i.test(message)) {
        return;
      }
      eventBus.dispatch('globalErrorEvent', { message });
    });
  }

  if (networkError) {
    eventBus.dispatch('globalErrorEvent', { message: networkError });
  }
});