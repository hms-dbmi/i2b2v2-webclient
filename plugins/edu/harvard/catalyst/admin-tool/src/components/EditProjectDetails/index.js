import { useDispatch, useSelector} from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Link from '@mui/material/Link';
import { Project } from "models";
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import "./EditProjectDetails.scss";
import {EditProjectDataSources, EditProjectParameters, EditProjectUserAssociations, ProjectInfo, StatusUpdate} from "components";
import Paper from "@mui/material/Paper";
import BottomNavigation from "@mui/material/BottomNavigation";
import Button from "@mui/material/Button";
import {
    getAllProjectParams,
    getAllProjectUsers,
    clearSelectedProject,
    getAllProjectDataSources,
    deleteProject,
    deleteProjectStatusConfirmed
} from "actions";
import {Confirmation} from "../index";


export const EditProjectDetails = ({project, setIsEditingProject, isEditUsers}) => {
    const selectedProject = useSelector((state) => state.selectedProject );
    const [updatedParams, setUpdatedParams] = useState(selectedProject.params);
    const deletedProject = useSelector((state) => state.deletedProject);
    const [activeStep, setActiveStep] = useState(0);
    const steps = ['Project Details', 'Parameters', 'Data Sources', "User Associations"];
    const [doSave, setDoSave] = useState(false);
    const [saveCompleted, setSaveCompleted] = useState(null);
    const [paginationModel, setPaginationModel] = useState({ pageSize: 5, page: 0});
    const [showDeleteProjectConfirm, setShowDeleteProjectConfirm] = useState(false);
    const [deleteProjectConfirmMsg, setDeleteProjectConfirmMsg] = useState("");
    const [showStatus, setShowStatus] = useState(false);
    const [statusMsg, setStatusMsg] = useState("");
    const [statusSeverity, setStatusSeverity] = useState("info");
    const isExistingProject = (project && project.internalId.length > 0);

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

    const handleDeleteProject = () => {
        setDeleteProjectConfirmMsg("");
        setShowDeleteProjectConfirm(false);

        dispatch(deleteProject({project}))
    };

    const confirmDeleteProject = () => {
        setDeleteProjectConfirmMsg("Are you sure you want to delete project " + project.name + "?");
        setShowDeleteProjectConfirm(true);
    };

    useEffect(() => {

        if(isEditUsers){
            setActiveStep(3);
        }
    }, [isEditUsers]);


    useEffect(() => {
        if(saveCompleted && activeStep===3){ //last step so exit edit project
            setIsEditingProject(false);
        }
        if(saveCompleted){
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
            setDoSave(false);
            setSaveCompleted(false);
        }else{
            setSaveCompleted(null);
            setDoSave(null);
        }
    }, [saveCompleted]);

    useEffect(() => {
        if(project.name) {
            dispatch(getAllProjectParams({project}));
            dispatch(getAllProjectUsers({project}));
        }else{
            dispatch(clearSelectedProject());
        }
    }, [project]);

    useEffect(() => {
        if(activeStep === 2 && selectedProject.project.name) {
            dispatch(getAllProjectDataSources({project: selectedProject.project}));
        }
    }, [activeStep]);

    useEffect(() => {
        setUpdatedParams(selectedProject.params);
    }, [selectedProject.params]);

    useEffect(() => {
        if(deletedProject.status === "SUCCESS") {
            dispatch(deleteProjectStatusConfirmed());
            setStatusMsg("Deleted project " + deletedProject.project.name);
            setShowStatus(true);
            setStatusSeverity("success");
            cancelEdit();
        }
        if(deletedProject.status === "FAIL") {
            dispatch(deleteProjectStatusConfirmed());
            setStatusMsg("Error: There was an error deleting project " + deletedProject.project.name);
            setShowStatus(true);
            setStatusSeverity("success");
        }
    }, [deletedProject]);

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

            { activeStep===0 && <ProjectInfo
                selectedProject={selectedProject}
                cancelEdit={setIsEditingProject}
                doSave={doSave}
                setSaveCompleted={setSaveCompleted}
            />
            }
            { activeStep===1 && !selectedProject.isFetchingParams
                && <EditProjectParameters
                    selectedProject={selectedProject}
                    updatedParams={updatedParams}
                    updateParams={setUpdatedParams}
                    doSave={doSave}
                    projectParamStatus={selectedProject.allParamStatus}
                    setSaveCompleted={setSaveCompleted}
                    paginationModel={paginationModel}
                    setPaginationModel={setPaginationModel}
                />
            }

            { activeStep===2  && <EditProjectDataSources
                selectedProject={selectedProject} doSave={doSave} setSaveCompleted={setSaveCompleted}
            />}

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
                        <Button onClick={cancelEdit} variant="outlined"> Exit </Button>
                    </div>
                    {isExistingProject && <div className="EditProjectActionSecondary">
                         <Button className={"DeleteProject"} variant="outlined" onClick={confirmDeleteProject}>Delete Project</Button>
                    </div>}

                    <div className="EditProjectActionPrimary">
                        <Button  variant="outlined" onClick={handleNext}>
                            {activeStep === 3 ? "Save and Exit" : "Save and Continue"} </Button>
                    </div>
                    {activeStep > 0 && <div className="EditProjectActionPrimary">
                        <Button  variant="outlined" onClick={handlePrevious}>
                            Previous
                        </Button>
                    </div>}
                </BottomNavigation>
            </Paper>

            <StatusUpdate isOpen={showStatus} setIsOpen={setShowStatus} severity={statusSeverity} message={statusMsg}/>

            { showDeleteProjectConfirm && <Confirmation
                text={deleteProjectConfirmMsg}
                onOk={handleDeleteProject}
                onCancel={() => setShowDeleteProjectConfirm(false)}
            />}
        </div>
    );
};

EditProjectDetails.propTypes = {
    project: PropTypes.shape(Project).isRequired,
    setIsEditingProject: PropTypes.func.isRequired
};

