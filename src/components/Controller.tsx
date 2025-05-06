import { PropsWithChildren, useEffect, useMemo } from "react";
import { generateUUID, labelFormatter } from "../lib/utils";
import { useBgsForm } from "../contexts/Form.context";
import { ControllerProps } from "../types";
import BgsFormControllerProvider from "../contexts/Controller.context";
import { Controller as FormController } from "react-hook-form";
import { useBgsFormGroup } from "../contexts/Group.context";
import validationRules from "../lib/validation-rules";

export default function Controller({ children, ...props }: PropsWithChildren<ControllerProps>) {
    const id = useMemo(() => generateUUID(), []);
    const { registerItem, unregisterItem, formControl, disabled, readOnly } = useBgsForm();
    const { name: nameGroup, formId: formIdParentGroup, ...propsGroup } = useBgsFormGroup()

    useEffect(() => {
        registerItem({ id, ...props });

        return () => {
            unregisterItem(id);
        }
    }, [id, props])

    if (!props.label && !props.noLabel) props.label = labelFormatter.changeAll(props.dataField)

    let disabledOne = false;

    if (typeof props.disabled === "boolean") {
        disabledOne = props.disabled;
    }
    else if (typeof propsGroup.disabled === "boolean") {
        disabledOne = propsGroup.disabled;
    }
    else disabledOne = !!disabled;

    let readOnlyOne = false;

    if (typeof props.readOnly === "boolean") {
        readOnlyOne = props.readOnly;
    }
    else if (typeof propsGroup.readOnly === "boolean") {
        readOnlyOne = propsGroup.readOnly;
    }
    else readOnlyOne = !!readOnly;

    let hiddenOnlyOne = false;

    if (typeof props.hidden === "boolean") {
        hiddenOnlyOne = props.hidden;
    }

    return <>
        {formControl.control && <FormController
            name={props.dataField}
            control={formControl.control}
            rules={(disabledOne || readOnlyOne || hiddenOnlyOne) ? { required: false } : validationRules(props)}
            render={(controller) => <>
                <BgsFormControllerProvider {...props} controller={controller}>
                    {children}
                </BgsFormControllerProvider>
            </>}
        />}
    </>
}