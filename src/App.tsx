// https://dev.to/gcanti/getting-started-with-fp-ts-ord-5f1e
import { useState } from "react";
import { Ord, min, max } from "fp-ts/lib/Ord";
import { contramap } from "fp-ts/lib/Ord";
import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import {
  Semigroup,
  getStructSemigroup,
  getJoinSemigroup,
  getMeetSemigroup,
  semigroupAny
} from "fp-ts/lib/Semigroup";
import { getMonoid } from "fp-ts/lib/Array";
import { ordNumber } from "fp-ts/lib/Ord";
import { getSemigroup } from "fp-ts/lib/NonEmptyArray";
import * as NEA from "fp-ts/lib/NonEmptyArray";
import { getValidation } from "fp-ts/lib/Either";
import { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import { sequenceT } from "fp-ts/lib/Apply";
import { map } from "fp-ts/lib/Either";
import { lift } from "./utils";
import "./styles.css";

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

console.log(min(ordNumber)(2, 1));

type User = {
  name: string;
  age: number;
};

const byAge: Ord<User> = contramap((user: User) => user.age)(ordNumber);

const getYounger = min(byAge);

const getOlder = max(byAge);

console.log(
  getYounger({ name: "Guido", age: 48 }, { name: "Giulio", age: 45 }) // { name: 'Giulio', age: 45 }
);

console.log(
  getOlder({ name: "Guido", age: 48 }, { name: "Giulio", age: 45 }) // { name: 'Guido', age: 48 }
);

interface Customer {
  name: string;
  favouriteThings: Array<string>;
  registeredAt: number; // since epoch
  lastUpdatedAt: number; // since epoch
  hasMadePurchase: boolean;
}

const semigroupCustomer: Semigroup<Customer> = getStructSemigroup({
  // keep the longer name
  name: getJoinSemigroup(contramap((s: string) => s.length)(ordNumber)),
  // accumulate things
  favouriteThings: getMonoid<string>(), // <= getMonoid returns a Semigroup for `Array<string>` see later
  // keep the least recent date
  registeredAt: getMeetSemigroup(ordNumber),
  // keep the most recent date
  lastUpdatedAt: getJoinSemigroup(ordNumber),
  // Boolean semigroup under disjunction
  hasMadePurchase: semigroupAny
});

console.log(
  semigroupCustomer.concat(
    {
      name: "Giulio",
      favouriteThings: ["math", "climbing"],
      registeredAt: new Date(2018, 1, 20).getTime(),
      lastUpdatedAt: new Date(2018, 2, 18).getTime(),
      hasMadePurchase: false
    },
    {
      name: "Giulio Canti",
      favouriteThings: ["functional programming"],
      registeredAt: new Date(2018, 1, 22).getTime(),
      lastUpdatedAt: new Date(2018, 2, 9).getTime(),
      hasMadePurchase: true
    }
  )
);

export default function App() {
  const [validation, setValidation] = useState<NonEmptyArray<string>>(
    NEA.of("Enter a password")
  );

  const foo = {
    bar: "hello"
  };

  return (
    <div className="App">
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
      {pipe(
        foo,
        O.fromNullable,
        O.map(({ bar }) =>
          pipe(
            bar,
            O.fromNullable,
            O.map((str) => str + 1)
          )
        ),
        O.chain((str) => O.fromNullable({ bar: "foo" })),
        O.map(({ bar }) => bar),
        O.fold(
          () => null,
          (data) => <div>{data}</div>
        )
      )}
    </div>
  );
}
