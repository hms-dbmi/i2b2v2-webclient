import { useDispatch, useSelector} from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Link from '@mui/material/Link';
import { Project } from "models";
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import {
    getAllProjectDataSources,
    getAllProjectParams, getAllProjectUsers,
} from "actions";

import "./EditProjectDetails.scss";
import {EditProjectDataSources, EditProjectParameters, EditProjectUserAssociations, ProjectInfo} from "components";
import Paper from "@mui/material/Paper";
import BottomNavigation from "@mui/material/BottomNavigation";
import Button from "@mui/material/Button";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

export const EditProjectDetails = ({project, setIsEditingProject}) => {
    const selectedProject = useSelector((state) => state.selectedProject );
    const [updatedParams, setUpdatedParams] = useState(selectedProject.params);
    const [activeStep, setActiveStep] = useState(0);
    const steps = ['Project Details', 'Parameters', 'Data Sources', "User Associations"];
    const [doSave, setDoSave] = useState(false);
    const [saveCompleted, setSaveCompleted] = useState(false);

    const dispatch = useDispatch();

    const isStepOptional = (step) => {
        return step === 1;
    };


    const handleNext = () => {
        setDoSave(true);
    };

    const handlePrevious = () => {
        setActiveStep((prevActiveStep) => prevActiveStep -1);
    };

    const cancelEdit = () => {
        setIsEditingProject(false);
    }

    useEffect(() => {
        if(saveCompleted){
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
            setDoSave(false);
            setSaveCompleted(false);
        }
    }, [saveCompleted]);

    useEffect(() => {
        if(project) {
            dispatch(getAllProjectParams({project}));
            dispatch(getAllProjectDataSources({project}));
            dispatch(getAllProjectUsers({project}));

        }
    }, [project]);

    useEffect(() => {
        setUpdatedParams(selectedProject.params);
    }, [selectedProject]);

    return (
        <div className={"EditProjectDetails"}>
            <Link  className="BackToUsers" component="button" onClick={cancelEdit}>back to All Projects</Link>

            <Stepper activeStep={activeStep}>
                {steps.map((label, index) => {
                    const stepProps = {};
                    const labelProps = {};
                    if (isStepOptional(index)) {
                        labelProps.optional = (
                            <Typography variant="caption">Optional</Typography>
                        );
                    }

                    return (
                        <Step key={label} {...stepProps}>
                            <StepLabel {...labelProps}>{label}</StepLabel>
                        </Step>
                    );
                })}
            </Stepper>

            { activeStep===0 && <ProjectInfo selectedProject={selectedProject} cancelEdit={setIsEditingProject}
                                             doSave={doSave} setSaveCompleted={setSaveCompleted}/>}
            { activeStep===1 && !selectedProject.isFetchingParams
                && <EditProjectParameters
                    selectedProject={selectedProject}
                    updatedParams={updatedParams}
                    updateParams={setUpdatedParams}
                    doSave={doSave}
                    setSaveCompleted={setSaveCompleted}
                />
            }

            { activeStep===2 && !selectedProject.isFetchingDataSources && <EditProjectDataSources selectedProject={selectedProject} doSave={doSave} setSaveCompleted={setSaveCompleted}/>}

            { activeStep===3 && !selectedProject.isFetchingUserRoles
                && <EditProjectUserAssociations
                    selectedProject={selectedProject}
                    doSave={doSave}
                    setSaveCompleted={setSaveCompleted}
                />
            }

            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
                <BottomNavigation className={"EditProjectActions"}>
                    <div  className="EditProjectActionSecondary">
                        <Button onClick={cancelEdit} variant="outlined"> Cancel </Button>
                    </div>
                    <div className="EditProjectActionPrimary">
                        <Button  variant="outlined" onClick={handleNext}>
                            {activeStep === 3 ? "Save and Exit" : "Save and Continue"} </Button>
                    </div>
                    <div className="EditProjectActionPrimary">
                        <Button  variant="outlined" onClick={handlePrevious}> Previous </Button>
                    </div>
                </BottomNavigation>
            </Paper>
        </div>
    );
};

EditProjectDetails.propTypes = {
    project: PropTypes.shape(Project).isRequired,
    setIsEditingProject: PropTypes.func.isRequired
};

