import {
  BisiacariaTextField,
  BisiacariaSubscribeButton,
} from "@/components/BisiacariaFormComponents";
import { BisiacariaOtpField } from "@/components/BisiacariaOtpField";
import { fieldContext, formContext } from "./demo.form-context";

import { createFormHook } from "@tanstack/react-form";

export const { useAppForm: useBisiacariaForm } = createFormHook({
  fieldComponents: {
    TextField: BisiacariaTextField,
    OtpField: BisiacariaOtpField,
  },
  formComponents: {
    SubscribeButton: BisiacariaSubscribeButton,
  },
  fieldContext,
  formContext,
});