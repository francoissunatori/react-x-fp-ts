import * as io from "io-ts";

type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
};

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

export { User, UserValidator };
