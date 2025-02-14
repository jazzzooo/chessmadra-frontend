import client from "~/utils/client";
import { HeadSiteMeta } from "./PageContainer";
import { c, s } from "~/utils/styles";
import { Spacer } from "~/components/Space";
import { Button } from "./Button";
import { CMText } from "./CMText";
import { createEffect, createSignal, For, Match, Show, Switch } from "solid-js";
import { PieceView } from "./chessboard/Chessboard";
import { trackEvent } from "~/utils/trackEvent";
import { Puff } from "solid-spinner";
import { RepertoirePageLayout } from "./RepertoirePageLayout";
import { TextInput } from "./TextInput";
import { capitalize } from "lodash-es";
type AuthType = "login" | "register";
const AUTH_TYPES: AuthType[] = ["login", "register"];
// import { createFormGroup, createFormControl } from "solid-forms";
import { isServer } from "solid-js/web";
import {
  createForm,
  email,
  Field,
  Form,
  minLength,
  required,
  SubmitHandler,
} from "@modular-forms/solid";
import { InputError } from "./forms/InputError";
import { A, Link } from "solid-start";
import { quick } from "~/utils/app_state";
import { AuthStatus } from "~/utils/user_state";
import { clsx } from "~/utils/classes";

type ForgotPasswordForm = {
  email: string;
};

export default function ForgotPassword() {
  const loginForm = createForm<ForgotPasswordForm>({
    initialValues: { email: "" },
  });

  const [serverError, setServerError] = createSignal("");

  const handleSubmit: SubmitHandler<ForgotPasswordForm> = (values, event) => {
    setServerError("");
    client
      .post("/api/forgot_password", { email: values.email })
      .then((resp) => {
        trackEvent(`auth.forgot_password.success`);
        alert("Email sent!");
      })
      .catch((err) => {
        trackEvent(`auth.forgot_password.error`);
        setServerError(err?.response?.data?.error ?? "Something went wrong");
      });
  };

  // createEffect(() => {
  //   console.log("errors", loginForm.internal.erro);
  // });
  return (
    <>
      <RepertoirePageLayout centered>
        <HeadSiteMeta
          siteMeta={{
            title: "Forgot password",
            description: "",
          }}
        />
        <div style={s(c.selfCenter)}>
          <div class="col items-center">
            <div style={s(c.size(48))}>
              <PieceView piece={{ color: "w", type: "n" }} pieceSet={"alpha"} />
            </div>
            <Spacer height={12} />
            <div class={`bg-gray-16 min-w-80 w-full self-stretch p-4`}>
              <p
                class={clsx("text-secondary mb-4 cursor-pointer ")}
                onClick={() => {
                  quick((s) => {
                    s.navigationState.push("/login");
                    trackEvent("auth.forgot_password.back");
                  });
                }}
              >
                <i class="fa-solid fa-arrow-left pr-2"></i>
                Back
              </p>
              <p class="text-lg font-semibold">Forgot your password?</p>
              <Spacer height={12} />
              <div style={s(c.br(4), c.px(0), c.py(0))}>
                <Form
                  of={loginForm}
                  class={`col gap-8`}
                  onSubmit={handleSubmit}
                >
                  <Field
                    of={loginForm}
                    name="email"
                    validate={[
                      required("Please enter your email."),
                      email("The email address is badly formatted."),
                    ]}
                  >
                    {(field) => (
                      <TextInput
                        value={field.value}
                        error={field.error}
                        placeholder="example@email.com"
                        {...field.props}
                        type="email"
                      />
                    )}
                  </Field>
                  <div class={"min-w-full max-w-min"}>
                    <InputError
                      name={"Server error"}
                      error={serverError()}
                      class={"inline-block"}
                    />
                    <input
                      type="submit"
                      value={"Get reset link"}
                      class="btn w-fit self-end px-8 py-4"
                    ></input>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </RepertoirePageLayout>
    </>
  );
}
