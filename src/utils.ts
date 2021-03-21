import { mapLeft } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import * as E from "fp-ts/lib/Either";

function lift<E, A>(
  check: (a: A) => E.Either<E, A>
): (a: A) => E.Either<NonEmptyArray<E>, A> {
  return (a) =>
    pipe(
      check(a),
      mapLeft((a) => [a])
    );
}

export { lift };
