// https://dev.to/gcanti/getting-started-with-fp-ts-ord-5f1e
import { useEffect, useState } from "react";
import { Ord, min, max } from "fp-ts/lib/Ord";
import { contramap } from "fp-ts/lib/Ord";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { fromEither } from "fp-ts/lib/Option";
import {
  Semigroup,
  getStructSemigroup,
  getJoinSemigroup,
  getMeetSemigroup,
  semigroupAny
} from "fp-ts/lib/Semigroup";
import { getMonoid } from "fp-ts/lib/Array";
import { ordNumber } from "fp-ts/lib/Ord";
import { Either, left } from "fp-ts/lib/Either";
import * as io from "io-ts";
import Password from "./Password";
import fetchJSON from "./fetchJSON";
import "./styles.css";

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

const PostValidator = io.type({
  userId: io.number,
  id: io.number,
  title: io.string,
  body: io.string
});

const UserValidator = io.type({
  id: io.number,
  name: io.string,
  username: io.string,
  email: io.string,
  address: io.type({
    street: io.string,
    suite: io.string,
    city: io.string,
    zipcode: io.string,
    geo: io.type({
      lat: io.string,
      lng: io.string
    })
  }),
  phone: io.string,
  website: io.string,
  company: io.type({
    name: io.string,
    catchPhrase: io.string,
    bs: io.string
  })
});

export default function App() {
  const [user, setUser] = useState<Either<Error | null, any>>(left(null));

  useEffect(() => {
    (async () => {
      setUser(
        await fetchJSON(
          "https://jsonplaceholder.typicode.com/users/1",
          UserValidator
        )
      );
    })();
  }, []);

  return (
    <div className="App">
      <Password />
      {pipe(
        user,
        fromEither,
        // O.map(({ bar }) =>
        //   pipe(
        //     bar,
        //     O.fromNullable,
        //     O.map((str) => str + 1)
        //   )
        // ),
        // O.chain((str) => O.fromNullable({ bar: "foo" })),
        // O.map(({ bar }) => bar),
        O.fold(
          () => null,
          (data) => <div>{data.id}</div>
        )
      )}
    </div>
  );
}
