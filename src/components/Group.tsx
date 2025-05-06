import React, { useMemo } from "react";
import { PropsWithChildren } from "react";
import { useBgsForm } from "../contexts/Form.context";
import { generateUUID } from "../lib/utils";
import BgsFormGroupProvider from "../contexts/Group.context";

export interface FormGroupProps  {
    name: string;
    disabled?: boolean;
    hidden?: boolean;
    readOnly?: boolean;
}

const FormGroup = ({ children, ...formProps }: PropsWithChildren<FormGroupProps>) => {
    const formRef = useBgsForm();

    const formGroupId = useMemo(() => generateUUID(), []);

    return <>
        <BgsFormGroupProvider {...formRef} {...formProps} formGroupId={formGroupId}>
            {children}
        </BgsFormGroupProvider>
    </>
}

FormGroup.displayName = "BgsFormGroup";

export default FormGroup;