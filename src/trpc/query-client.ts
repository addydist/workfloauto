import {
    defaultShouldDehydrateQuery,
    QueryClient,
  } from '@tanstack/react-query';
  /**
   * Creates a QueryClient configured with this project's react-query defaults.
   *
   * The client uses a 30-second query staleTime and a dehydrate strategy that
   * dehydrates queries when the default rule applies or when a query's state is
   * `'pending'`.
   *
   * @returns A QueryClient instance configured with the described defaults.
   */
  export function makeQueryClient() {
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 30 * 1000,
        },
        dehydrate: {
          // serializeData: superjson.serialize,
          shouldDehydrateQuery: (query) =>
            defaultShouldDehydrateQuery(query) ||
            query.state.status === 'pending',
        },
        hydrate: {
          // deserializeData: superjson.deserialize,
        },
      },
    });
  }