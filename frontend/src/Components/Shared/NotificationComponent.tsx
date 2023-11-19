import * as React from "react";
import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/material/Alert";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { selectCurrentNotification } from "../../app/slices/notification";
import { markAsImpacted } from "../../app/slices/notification";

const NotificationComponent: React.FC<{}> = () => {
  const notification = useAppSelector(selectCurrentNotification);
  const dispatch = useAppDispatch();
  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    dispatch(markAsImpacted());
  };

  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <div>
      <Snackbar
        open={!notification?.impacted}
        autoHideDuration={10000}
        onClose={handleClose}
        message={notification.text}
        action={action}
        anchorOrigin={{
          horizontal: "right",
          vertical: "bottom",
        }}
      >
        <Alert
          onClose={handleClose}
          severity={
            notification.status === "success" || notification.status === "error"
              ? notification.status
              : "info"
          }
          sx={{ width: "100%" }}
        >
          {notification.text}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default NotificationComponent;
