import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import "./RequestCommentsView.scss";
import {
    Box,
    Button,
    Card,
    CircularProgress,
    TextField,
    Typography
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
    getRequestComments,
    updateRequestComments,
    updateRequestCommentsConfirmed
} from "../../reducers/requestCommentsSlice";

export const RequestCommentsView = ({queryMasterId, queryInstanceId}) => {
    const dispatch = useDispatch();
    const {comments, isSaving, isFetching, saveStatusInfo} = useSelector((state) => state.requestComments);
    const [newComment, setNewComment] = React.useState("");
    const [isEditing, setIsEditing] = React.useState(false);

    const handleAddRequestComment = (event) => {
        dispatch(updateRequestComments({comments: newComment, queryInstanceId}));
    }

    const handleRestoreComment = (event) => {
        setNewComment(comments);
    }

    const handleEditComment = (event) => {
        setIsEditing(true);
    }

    const handleCancelEditComment = (event) => {
        setIsEditing(false);
    }

    useEffect(() => {
        dispatch(getRequestComments({queryMasterId}));
    }, []);

    useEffect(() => {
        setNewComment(comments);
    }, [comments]);

    useEffect(() => {
        if(saveStatusInfo.status === "SUCCESS"){
            setIsEditing(false);
            dispatch(updateRequestCommentsConfirmed());
        }
    }, [saveStatusInfo]);

    return (
        <Box className={"RequestCommentsView"}>
            <Typography className={"RequestDetailCommentsTitle"}>
                Request Comments
            </Typography>
            <Card  className={"RequestDetailCommentsContent"}>
                <Grid className={"AddCommentsMain"} container spacing={2}>
                    <Grid size={10}>
                        <TextField
                            className={!isEditing ? "TextReadOnlyMode" : ""}
                            multiline
                            rows={5}
                            value={newComment}
                            onChange={(event) => {
                                setNewComment(event.target.value);
                            }}
                            disabled={isSaving || isFetching}
                            inputProps={{
                                readOnly: !isEditing,
                            }}
                        />
                    </Grid>
                    <Grid  className={"AddCommentActions"} size={1}>
                        <Button variant="outlined" size={"small"} onClick={handleRestoreComment}>Restore</Button>
                        {!isEditing ? <Button variant="contained" className={"CommentBtn"} size={"small"} onClick={handleEditComment}>Edit</Button> :
                            <Button variant="outlined" className={"CommentBtn"} size={"small"} onClick={handleCancelEditComment}>Cancel</Button>
                        }
                        {isEditing && <Button variant="contained" className={"CommentBtn"} size={"small"}
                                 disabled={newComment.length === 0 || newComment === comments} onClick={handleAddRequestComment}>
                             Save {isSaving && <CircularProgress size="15px"/>}
                         </Button>
                        }
                    </Grid>
                </Grid>
            </Card>
        </Box>
    )
}