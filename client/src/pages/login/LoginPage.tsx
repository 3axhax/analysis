import React, { ChangeEvent, useEffect, useState } from "react";
import useDocumentTitle from "@shared/hooks/useDocumentTitle.tsx";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import {
  loginUser,
  resetError,
  selectErrorUser,
  selectIsUserAuthorized,
  selectPendingUser,
} from "@entities/user";
import { useNavigate } from "react-router-dom";

export const LoginPage = () => {
  useDocumentTitle("Войти");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const pending = useAppSelector(selectPendingUser);
  const error = useAppSelector(selectErrorUser);
  const isUserAuthorized = useAppSelector(selectIsUserAuthorized);

  const handlerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  useEffect(() => {
    dispatch(resetError());
  }, [dispatch]);

  useEffect(() => {
    if (isUserAuthorized) {
      navigate("/");
    }
  }, [navigate, isUserAuthorized]);

  return (
    <div className="app">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Войти
        </h1>
      </div>

      <div className="mx-auto text-left">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
          <form
            className="space-y-2 text-gray-600 dark:text-gray-300"
            onSubmit={handlerSubmit}
          >
            <div className={"flex items-center"}>
              <label>
                E-mail:
                <input
                  autoComplete={"on"}
                  type={"email"}
                  placeholder={"mail@mail.com"}
                  className={
                    "px-4 py-2 ml-[10px] border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  }
                  value={email}
                  onInput={(e: ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                />
              </label>
            </div>

            <div className={"flex items-center"}>
              <label>
                Password:
                <input
                  autoComplete={"on"}
                  type={"password"}
                  placeholder={"*****"}
                  className={
                    "px-4 py-2 ml-[10px] border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  }
                  value={password}
                  onInput={(e: ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                />
              </label>
            </div>

            {error && (
              <div className={"bg-red-200 border-1 rounded-md px-4 py-2"}>
                {error}
              </div>
            )}

            <button
              type={"submit"}
              className={
                "bg-blue-600 text-white rounded-lg px-4 py-2 cursor-pointer hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
              }
              disabled={pending}
            >
              Войти
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
