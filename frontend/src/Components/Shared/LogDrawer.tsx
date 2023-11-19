import React from "react";
import {
  Drawer,
  List,
  Divider,
  ListItem,
  Typography,
  Button,
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import styled from "@emotion/styled";
import LogoDevIcon from "@mui/icons-material/LogoDev";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL_DOMAIN_NAME } from "../../config";
import { useAppDispatch } from "../../app/hooks";
import { addNotification } from "../../app/slices/notification";

interface LogDrawerProps {
  isOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const LogDrawer: React.FC<LogDrawerProps> = ({ isOpen, setOpen }) => {
  const getLogFiles = () => ["TelekomLog"];

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleFileSelection = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files?.length) {
      for (let i = 0; i < event.target.files.length; i++) {
        const requestBody = new FormData();
        requestBody.append("file", event.target.files[i]);
        try {
          const response = await fetch(
            "http://" + BACKEND_URL_DOMAIN_NAME + "/file_upload",
            {
              method: "POST",
              body: requestBody,
            }
          );
          if (response.status <= 300 && response.status >= 200) {
            dispatch(
              addNotification({
                text: `${event.target.files[0].name} was successfully uploaded`,
                timeStamp: Date.now(),
                type: "success",
                acknowledged: false,
              })
            );
            setOpen(false);
          }
        } catch (error) {
          console.error("ERROR DURING FILE UPLOAD", error);
        }
      }
    }
  };

  return (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={() => setOpen(false)}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <List
        style={{
          flex: 9,
          minWidth: "200px",
        }}
      >
        {getLogFiles().map((logFileName, index) => (
          <Button
            onClick={() => {
              navigate(`/chats/${logFileName}`);
              setOpen(false);
            }}
            key={index}
          >
            <ListItem>
              <LogoDevIcon
                style={{
                  marginRight: "20px",
                }}
              />
              <Typography variant="body1">{logFileName}</Typography>
            </ListItem>
          </Button>
        ))}
      </List>
      <Divider />
      <Button
        component="label"
        style={{
          flex: 1,
        }}
      >
        <VisuallyHiddenInput type="file" onChange={handleFileSelection} />
        <FileUploadIcon />
      </Button>
    </Drawer>
  );
};

export default LogDrawer;
