import { ExpandLessSharp } from "@mui/icons-material";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  Box,
  Button,
} from "@mui/material";
import React from "react";
import Socket from "../../utils/Socket";

const SummarySelector: React.FC<{}> = () => {
  const [category, setCategory] = React.useState<string>("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCategory(event.target.value);
  };

  const generate = (event: React.MouseEvent) => {
    const socket = Socket.getInstance();
    const message = {
      type: "summary",
      data: {
        category: category,
      },
    };
    socket.send(JSON.stringify(message));
  };

  const summaryTypes: string[] = [
    "Error",
    "Warning",
    "Failed",
    "Version",
    "Access",
  ];

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandLessSharp />}>
        <Typography variant="h5">Summary generation</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="h6" textAlign={"left"}>
          Summary Type
        </Typography>
        <RadioGroup
          value={category}
          onChange={handleChange}
          style={{
            display: "flex",
            justifyContent: "flex-start",
          }}
        >
          {summaryTypes.map((summaryType, index) => (
            <FormControlLabel
              key={index}
              value={summaryType}
              control={<Radio />}
              label={summaryType}
            />
          ))}
        </RadioGroup>

        <Box
          style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}
        >
          <Button variant="outlined" onClick={generate}>
            Generate
          </Button>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default SummarySelector;
