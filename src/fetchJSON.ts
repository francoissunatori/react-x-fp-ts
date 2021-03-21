// https://github.com/remojansen/react-fetchable/blob/master/src/client.ts
import { Either, fold, left, right } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { Type, Errors } from "io-ts";
import { reporter } from "io-ts-reporters";

export async function fetchJson<T, O, I>(
  url: string,
  validator: Type<T, O, I>
  // init?: RequestInit
): Promise<Either<Error, T>> {
  try {
    const response = await fetch(url /*, init */);
    const json: I = await response.json();
    const result = validator.decode(json);

    return pipe(
      result,
      fold(
        (errors: Errors) => {
          const messages = reporter(result);
          return left(new Error(messages.join("\n")));
        },
        (value: T) => {
          return right(value);
        }
      )
    );
  } catch (err) {
    return Promise.resolve(left(err));
  }
}
