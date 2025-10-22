import React, { ChangeEvent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { useNavigate } from "react-router-dom";
import {
  loginUser,
  resetError,
  selectErrorUser,
  selectIsUserAuthorized,
  selectPendingUser,
} from "@entities/user";
import { useInfoModalData } from "@app/providers/infoModalProvider";

export const LoginForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const pending = useAppSelector(selectPendingUser);
  const error = useAppSelector(selectErrorUser);
  const isUserAuthorized = useAppSelector(selectIsUserAuthorized);
  const { closeModal } = useInfoModalData();

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
      closeModal();
    }
  }, [navigate, isUserAuthorized, closeModal]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
      <form
        className="space-y-2 text-gray-600 dark:text-gray-300"
        onSubmit={handlerSubmit}
      >
        <div className={"relative mb-5"}>
          <input
            autoComplete={"on"}
            type={"email"}
            placeholder={"mail@mail.com"}
            className={"form-control"}
            value={email}
            onInput={(e: ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
          />
          <label className={"form-label"}>E-mail</label>
        </div>

        <div className={"relative mb-5"}>
          <input
            autoComplete={"on"}
            type={"password"}
            placeholder={"*****"}
            className={"form-control"}
            value={password}
            onInput={(e: ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
          />
          <label className={"form-label"}>Password</label>
        </div>

        {error && (
          <div className={"bg-red-200 border-1 rounded-md px-4 py-2"}>
            {error}
          </div>
        )}

        <button
          type={"submit"}
          className={"btn btn-primary"}
          disabled={pending}
        >
          Войти
        </button>
      </form>
    </div>
  );
};
