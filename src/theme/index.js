import { createTheme } from "@mui/material";

export const theme = createTheme({
    palette: {
        primary: {
            main: '#fff',
        },
        secondary: {
            main: '#1da1f2'
        }
    },
    components: {
        MuiCheckbox: {
            defaultProps: {
                color: 'secondary'
            }
        }
    }
})