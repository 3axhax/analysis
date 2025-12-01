import {useAppDispatch} from "@shared/store/hooks.ts";
import {useEffect} from "react";
import {getFullAdminAnalysisTypeList} from "@entities/adminAnalysisType/model";


export const useFullAdminAnalysisTypesLoad = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(getFullAdminAnalysisTypeList());
    }, [dispatch]);
};