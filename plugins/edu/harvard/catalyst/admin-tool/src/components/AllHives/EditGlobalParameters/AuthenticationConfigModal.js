import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogContentText from "@mui/material/DialogContentText";
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import {DialogTitle, TextField} from "@mui/material";
import {AUTH_CONFIG_PARAM_NAME, AUTHENTICATION_METHODS, DataType, ParamStatus} from "../../../models";
import {saveGlobalParam} from "../../../actions";
import {useDispatch} from "react-redux";

export const AuthenticationConfigModal = ({ onOk, onCancel }) => {
    const [showDomainSettings, setShowDomainSettings] = useState(false);
    const [showLDAPSettings, setShowLDAPSettings] = useState(false);
    const [authMethod, setAuthMethod] = useState('');
    const [authName, setAuthName] = useState('');
    const [LDAPSettings, setLDAPSettings] = useState({});
    const [domainSettings, setDomainSettings] = useState({});
    const dispatch = useDispatch();

    const handleShowLDAPSettings = () => {
        setShowDomainSettings(false);
        setShowLDAPSettings(true);
    };

    const handleShowDomainSettings = () => {
        setShowLDAPSettings(false);
        setShowDomainSettings(true);
    };

    const handleHideDomainSettings = () => {
        setShowDomainSettings(false);
        setShowLDAPSettings(false);
    };

    const saveAuthConfig= () => {
        let authConfig = {
            name: authName,
            method: authMethod
        }

        if(authMethod === AUTHENTICATION_METHODS.NTLM.value ||
            authMethod === AUTHENTICATION_METHODS.NTLM2.value ||
            authMethod === AUTHENTICATION_METHODS.OKTA.value
        ){
            authConfig.authConfigOptions = domainSettings;
        }
        if(authMethod === AUTHENTICATION_METHODS.LDAP.value){
            authConfig.authConfigOptions = LDAPSettings;
        }
        const authConfigParam = {
            name: AUTH_CONFIG_PARAM_NAME,
            value: JSON.stringify(authConfig),
            dataType: DataType.T,
            status: ParamStatus.A
        };

        if(authName.length > 0) {
            dispatch(saveGlobalParam({param: authConfigParam}));
        }
        onOk();
    };

    return (
        <div>
            <Dialog
                className={"AuthenticationConfigModal"}
                open={true}
                onClose={onCancel}
                fullWidth={true}
                maxWidth={'sm'}
                PaperProps={{
                    sx: {
                        minHeight: '60%',
                        maxHeight: '60%'
                    }
                }}
                aria-labelledby="authentication-config"
            >
                <DialogTitle id="authentication-config-title">
                    Define Authentication Template
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="authentication-config-description">
                        <Stack direction="column"
                               spacing={1}
                               sx={{
                                   justifyContent: "center",
                                   alignItems: "flex-start",
                               }}
                        >
                            <TextField label="Display Name"
                                       required
                                       variant="standard"
                                       value={authName}
                                       onChange={(event) => {setAuthName(event.target.value);}}
                                       sx={{ minWidth: 300 }}/>
                            <TextField
                                select
                                required
                                label="Authentication Method"
                                value={authMethod}
                                variant="standard"
                                helperText={authMethod === AUTHENTICATION_METHODS.NTLM.value ? "NOTE: Use oF NTLM is not recommended.":""}
                                onChange={(event) => {setAuthMethod(event.target.value);}}
                                sx={{ minWidth: 200 }}
                            >
                                    <MenuItem value=""></MenuItem>
                                    <MenuItem value={AUTHENTICATION_METHODS.LDAP.value} onClick={handleShowLDAPSettings}>{AUTHENTICATION_METHODS.LDAP.name}</MenuItem>
                                    <MenuItem value={AUTHENTICATION_METHODS.NTLM.value} onClick={handleShowDomainSettings}>{AUTHENTICATION_METHODS.NTLM.name}</MenuItem>
                                    <MenuItem value={AUTHENTICATION_METHODS.NTLM2.value} onClick={handleShowDomainSettings}>{AUTHENTICATION_METHODS.NTLM2.name}</MenuItem>
                                    <MenuItem value={AUTHENTICATION_METHODS.OKTA.value} onClick={handleShowDomainSettings}>{AUTHENTICATION_METHODS.OKTA.name}</MenuItem>
                                    <MenuItem value={AUTHENTICATION_METHODS.SAML.value} onClick={handleHideDomainSettings}>{AUTHENTICATION_METHODS.SAML.name}</MenuItem>
                            </TextField>
                            {showDomainSettings && <div> <TextField label="Domain"
                                                            required
                                                            value={domainSettings.domain}
                                                            placeholder={"Example: i2b2.org"}
                                                            onChange={(event) => {setDomainSettings({...domainSettings, domain: event.target.value})}}
                                                            variant="standard" sx={{ minWidth: 300 }}/>
                             <TextField label="Domain Controller"
                                                            required
                                                            value={domainSettings.domain_controller}
                                                            placeholder={"Example: pdc.i2b2.org"}
                                                            onChange={(event) => {setDomainSettings({...domainSettings, domain_controller: event.target.value})}}
                                                            variant="standard" sx={{ minWidth: 300 }} />
                                </div>
                            }
                            {showLDAPSettings && <Stack
                                direction="column"
                                spacing={1}
                                sx={{
                                    justifyContent: "center",
                                    alignItems: "flex-start",
                                }}>
                                <TextField
                                    required
                                    label="Connection URL"
                                    value={LDAPSettings.connection_url}
                                    onChange={(event) => {setLDAPSettings({...LDAPSettings, connection_url: event.target.value})}}
                                    variant="standard" sx={{ minWidth: 300 }}/>
                                <TextField label="Search Base"
                                   required
                                   value={LDAPSettings.search_base}
                                   onChange={(event) => {setLDAPSettings({...LDAPSettings, search_base: event.target.value})}}
                                   variant="standard" sx={{ minWidth: 300 }} />
                                <TextField label="Distinguished Name"
                                           required
                                           value={LDAPSettings.distinguished_name}
                                           onChange={(event) => {setLDAPSettings({...LDAPSettings, distinguished_name: event.target.value})}}
                                           variant="standard" sx={{ minWidth: 300 }} />
                                <TextField label="Max Buffer"
                                           value={LDAPSettings.max_buffer}
                                           onChange={(event) => {setLDAPSettings({...LDAPSettings, max_buffer: event.target.value})}}
                                           variant="standard" sx={{ minWidth: 300 }} />
                                <Stack
                                    direction="row"
                                    spacing={5}
                                >
                                    <TextField
                                        select
                                        required
                                        label="Security Authentication"
                                        value={LDAPSettings.security_authentication}
                                        variant="standard"
                                        sx={{ minWidth: 200 }}
                                        onChange={(event) => {setLDAPSettings({...LDAPSettings, security_authentication: event.target.value});}}
                                    >
                                        <MenuItem value="none">
                                            <em>none</em>
                                        </MenuItem>
                                        <MenuItem value={"simple"}>{"simple"}</MenuItem>
                                        <MenuItem value={"DIGEST-MD5"}>{"DIGEST-MD5"}</MenuItem>
                                        <MenuItem value={"CRAM-MD5"}>{"CRAM-MD5"}</MenuItem>
                                        <MenuItem value={"EXTERNAL"}>{"EXTERNAL"}</MenuItem>
                                    </TextField>

                                    <TextField
                                        select
                                        label="SSL"
                                        value={LDAPSettings.ssl}
                                        variant="standard"
                                        sx={{ minWidth: 200 }}
                                        onChange={(event) => {setLDAPSettings({...LDAPSettings, ssl: event.target.value});}}
                                    >
                                        <MenuItem value={"true"}>{"true"}</MenuItem>
                                        <MenuItem value={"false"}>{"false"}</MenuItem>
                                    </TextField>
                                </Stack>
                                <Stack
                                    direction="row"
                                    spacing={5}
                                    >
                                    <TextField
                                        select
                                        label="Security Layer"
                                        value={LDAPSettings.security_layer}
                                        variant="standard"
                                        sx={{ minWidth: 200 }}
                                        onChange={(event) => {setLDAPSettings({...LDAPSettings, security_layer: event.target.value});}}
                                    >
                                        <MenuItem value={"auth-conf"}>{"auth-conf"}</MenuItem>
                                        <MenuItem value={"auth-int"}>{"auth-int"}</MenuItem>
                                        <MenuItem value={"auth-conf,auth-int"}>{"auth-conf,auth-int"}</MenuItem>
                                        <MenuItem value={"auth-int,auth-conf"}>{"auth-int,auth-conf"}</MenuItem>
                                    </TextField>

                                    <TextField
                                        select
                                        label="Privacy Strength"
                                        value={LDAPSettings.privacy_strength}
                                        variant="standard"
                                        sx={{ minWidth: 200 }}
                                        onChange={(event) => {setLDAPSettings({...LDAPSettings, privacy_strength: event.target.value});}}
                                    >
                                        <MenuItem value=""></MenuItem>
                                        <MenuItem value={"high"}>{"high"}</MenuItem>
                                        <MenuItem value={"medium"}>{"medium"}</MenuItem>
                                        <MenuItem value={"low"}>{"low"}</MenuItem>
                                        <MenuItem value={"high,medium"}>{"high,medium"}</MenuItem>
                                        <MenuItem value={"high,low"}>{"high,low"}</MenuItem>
                                        <MenuItem value={"medium,low"}>{"medium,low"}</MenuItem>
                                    </TextField>
                                </Stack>
                                </Stack>
                            }
                        </Stack>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={saveAuthConfig} variant="outlined" color="primary">
                        Save
                    </Button>
                    <Button onClick={onCancel} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

AuthenticationConfigModal.propTypes = {
    onOk: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
};