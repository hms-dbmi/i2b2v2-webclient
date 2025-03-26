import React, {useEffect} from "react";
import {useSelector, useDispatch} from "react-redux";
import {Researcher} from "../Researcher";
import {getUserInfo} from "../../reducers/userInfoSlice";
import {updateI2b2LibLoaded} from "../../reducers/i2b2LibLoadedSlice";
import {Admin} from "../Admin";

export const DataRequestManager = () => {
    const dispatch = useDispatch();
    const { isManager } = useSelector((state) => state.userInfo);
    const isI2b2LibLoaded  = useSelector((state) => state.isI2b2LibLoaded);

    const i2b2LibLoaded = () => {
        dispatch(updateI2b2LibLoaded());
    }

    useEffect(() => {
        if (!isI2b2LibLoaded) {
            window.addEventListener('I2B2_READY', i2b2LibLoaded);
        }else{
            dispatch(getUserInfo());
        }
    }, [isI2b2LibLoaded]);


    return (
        <div>
            {!isManager ? <Researcher/> : <Admin/> }
        </div>
    )
}