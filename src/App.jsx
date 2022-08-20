import Map4dMap from './Map4dMap'
import { Box, Toolbar, AppBar as MuiAppBar, IconButton, Drawer, Typography, ThemeProvider, Divider } from '@mui/material'
import { Menu as MenuIcon } from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import { useState } from 'react'
import { DataClassList } from './components/data-class-list/DataClassList'
import { theme } from './theme'

const drawerWidth = 250;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'center',
  textTransform: 'uppercase',
  fontWeight: 600,
  letterSpacing: 0,
}));

function App() {
  const [open, setOpen] = useState(true)

  const onMapReady = (map, id) => {
    console.log(`Map with id ${id} is created`)
    //TODO: Map interaction from here
    let centerMap = map.getCamera().getTarget()
    let marker = new window.map4d.Marker({
      position: centerMap,
      anchor: [0.5, 1.0],
      label: new window.map4d.MarkerLabel({ text: "Demo Marker", color: "FF00FF", fontSize: 12 })
    })
    // Thêm marker vào bản đồ
    marker.setMap(map)
  }


  return (
    <ThemeProvider theme={theme}>
      <Box>
        <AppBar position="fixed" open={open} elevation={0}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={() => setOpen(!open)}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              boxShadow: '-3px 0 8px 0px #000000b0;',
            },
          }}
          variant="persistent"
          anchor="left"
          open={open}
        >
          <DrawerHeader><Typography variant='subtitle1' component='h6'>Danh sách lớp dữ liệu</Typography></DrawerHeader>
          <Divider sx={{ marginBottom: 1 }} />
          <DataClassList />
        </Drawer>
        <Box sx={{marginLeft: open? drawerWidth+10+'px' : 0,}}>
          {/* <Map4dMap
            key="map4d"
            id="map4d"
            onMapReady={onMapReady}
            options={{
              center: { lat: 16.0721634, lng: 108.226905 },
              zoom: 15
            }}
            accessKey="b77745a2eb604d0989e2b5648d0019b2"
            version="2.1" /> */}
        </Box>

      </Box>
    </ThemeProvider>
  );
}

export default App;
