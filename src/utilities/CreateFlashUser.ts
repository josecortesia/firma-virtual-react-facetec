import { faker } from "@faker-js/faker";
import { Config } from "../../Config";

export interface ISessionsCreateUserProps {
  rfc: string;
  first_name: string;
  last_name: string;
  mother_last_name: string;
  phone: string;
  email: string;
  password: string;
  username?: string;
}

export const fakeUser = (): ISessionsCreateUserProps => ({
  email: faker.internet.email({
    firstName: "fv",
    lastName: "fsession",
  }) as string,
  first_name: faker.lorem.word({ length: 2 }) as string,
  last_name: faker.lorem.word({ length: 1 }) as string,
  mother_last_name: faker.lorem.word({ length: 1 }) as string,
  password: faker.internet.password() as string,
  phone: faker.string.numeric({ length: 9 }) as string,
  rfc: `99${faker.string.numeric({ length: 4 })}33`,
  username: faker.internet.userName() as string,
});

export const LoginFlashUser = async (email: string, password: string) => {
  try {
    const result = await fetch(`${Config.fvBaseURL}/auth/login`, {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await result.json();
    if (data.status === "success") {
      localStorage.setItem("flashUserToken", data.data.token);
    }
    return data.data.user;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const CreateFlashUser = async () => {
  const flashUser = fakeUser();

  if (flashUser) {
    try {
      const result = await fetch(`${Config.fvBaseURL}/auth/register`, {
        method: "POST",
        body: JSON.stringify({
          username: flashUser.email,
          rfc: flashUser.rfc,
          first_name: flashUser.first_name,
          last_name: flashUser.last_name,
          mother_last_name: flashUser.mother_last_name,
          password: flashUser.password,
          email: flashUser.email,
          phone: flashUser.phone,
          role_id: 2
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const user = await result.json();

      if (user.status === "success") {
        const loggedIn = await LoginFlashUser(
          flashUser.email,
          flashUser.password,
        );

        if (loggedIn.status === "success") {
          localStorage.setItem("flashUserToken", loggedIn.data[0].token);
        }
      }

      return user;
    } catch (error: any) {
      throw new Error(error);
    }
  }
};
