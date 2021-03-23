// https://dev.to/gcanti/getting-started-with-fp-ts-ord-5f1e
import { useEffect, useState } from "react";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { fromEither } from "fp-ts/lib/Option";
import { Either, left } from "fp-ts/lib/Either";
import { Lens } from "monocle-ts";
import Password from "./Password";
import { User, UserValidator } from "./User";
import fetchJSON from "./fetchJSON";
import "./styles.css";

export default function App() {
  const [eitherUser, setEitherUser] = useState<Either<Error | null, any>>(
    left(null)
  );

  useEffect(() => {
    (async () => {
      setEitherUser(
        await fetchJSON(
          "https://jsonplaceholder.typicode.com/users/1",
          UserValidator
        )
      );
    })();
  }, []);

  const lensLat = Lens.fromPath<User>()(["address", "geo", "lat"]);
  const lensLng = Lens.fromPath<User>()(["address", "geo", "lng"]);

  return (
    <div className="App">
      <Password />
      {pipe(
        eitherUser,
        fromEither,
        O.map((user) => lensLat.get(user)),
        O.fold(
          () => null,
          (lat) => <div>{lat}</div>
        )
      )}
      {pipe(
        eitherUser,
        fromEither,
        O.map((user) => lensLng.get(user)),
        O.fold(
          () => null,
          (lng) => <div>{lng}</div>
        )
      )}
    </div>
  );
}
