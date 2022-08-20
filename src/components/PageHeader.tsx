import { Box, IconButton, Typography } from "@mui/material";
import BackIcon from '@mui/icons-material/ChevronLeft';
import { Link } from "react-router-dom";

const PageHeader = ({text, backUrl, backAriaText} :{text:string, backUrl?:string, backAriaText?:string}) => (
  <Typography variant="h6" sx={{minHeight:'calc(1.5em + 16px)', m:0, display:'flex', alignItems: 'start' }}>
  {backUrl && (
    <IconButton color="primary" aria-label={backAriaText} component={Link} to={backUrl} >
      <BackIcon />
    </IconButton>
  )}
  <Box sx={{mt:'4px'}}>{text}</Box>
</Typography>
)

export default PageHeader;
