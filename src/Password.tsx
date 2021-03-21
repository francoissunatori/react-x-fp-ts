import { useState } from "react";
import { getSemigroup } from "fp-ts/lib/NonEmptyArray";
import * as NEA from "fp-ts/lib/NonEmptyArray";
import { getValidation } from "fp-ts/lib/Either";
import { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import { sequenceT } from "fp-ts/lib/Apply";
import { map } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/lib/Either";
import { lift } from "./utils";

const minLength = (s: string): E.Either<string, string> =>
  s.length >= 6 ? E.right(s) : E.left("at least 6 characters");

const oneCapital = (s: string): E.Either<string, string> =>
  /[A-Z]/g.test(s) ? E.right(s) : E.left("at least one capital letter");

const oneNumber = (s: string): E.Either<string, string> =>
  /[0-9]/g.test(s) ? E.right(s) : E.left("at least one number");

const minLengthV = lift(minLength);
const oneCapitalV = lift(oneCapital);
const oneNumberV = lift(oneNumber);

function validatePassword(s: string): E.Either<NonEmptyArray<string>, string> {
  return pipe(
    sequenceT(getValidation(getSemigroup<string>()))(
      minLengthV(s),
      oneCapitalV(s),
      oneNumberV(s)
    ),
    map(() => s)
  );
}

export default function Password() {
  const [validation, setValidation] = useState<NonEmptyArray<string>>(
    NEA.of("Enter a password")
  );

  return (
    <>
      Password
      <input
        onChange={(event) =>
          setValidation(
            pipe(
              validatePassword(event.target.value),
              E.fold(
                (data) => data,
                () => NEA.of("all good!")
              )
            )
          )
        }
      />
      {validation}
    </>
  );
}
