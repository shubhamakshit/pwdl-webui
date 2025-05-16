import { createTheme,useTheme } from '@mui/material/styles';
import WebSettingsManager from "@/lib/WebSettingsManager";

const darkTheme = createTheme(WebSettingsManager.getValue("custom_theme") || WebSettingsManager.defaultTheme);




export default darkTheme;
