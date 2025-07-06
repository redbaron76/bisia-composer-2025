import {
  Select,
  SubscribeButton,
  TextArea,
  TextField,
} from "@/components/demo.FormComponents";
import { fieldContext, formContext } from "./demo.form-context";

import { createFormHook } from "@tanstack/react-form";

export const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
    Select,
    TextArea,
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
});
