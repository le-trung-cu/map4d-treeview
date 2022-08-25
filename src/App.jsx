import Map4dMap from './Map4dMap'
import { Box, Toolbar, AppBar as MuiAppBar, IconButton, Drawer, Typography, ThemeProvider, Divider, ToggleButtonGroup, ToggleButton, Slide, Tooltip } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu';
import RemoveRedEyeRoundedIcon from '@mui/icons-material/RemoveRedEyeRounded';
import NearMeRoundedIcon from '@mui/icons-material/NearMeRounded';
import DesignServicesRoundedIcon from '@mui/icons-material/DesignServicesRounded';
import SelectAllRoundedIcon from '@mui/icons-material/SelectAllRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import { styled } from '@mui/material/styles'
import { useEffect, useRef, useState } from 'react'
import { DataClassList } from './components/data-class-list/DataClassList'
import { theme } from './theme'

const drawerWidth = 380;
const mapEventOptions = {
  location: true,
  mappoi: true,
  mapbuilding: true,
  marker: true,
  polygon: true,
  polyline: true,
  circle: true,
  poi: true,
  building: true,
  place: true,
}

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

function getMidpoint(path = [{ lat: 0, lng: 0 }]) {
  const measure = new window.map4d.Measure(path)
  const length = measure.length / 2
  if (length === 0) return path[0]
  let cumulativeLength = 0
  let segmentLength = 0
  let index = 0

  while (cumulativeLength + segmentLength < length) {
    cumulativeLength += segmentLength
    measure.setPath([path[index], path[++index]])
    segmentLength = measure.length
  }
  const p1 = path[index - 1]
  const p2 = path[index]
  measure.setPath([p1, p2])
  const t = (length - cumulativeLength) / measure.length
  return { lat: p1.lat + (p2.lat - p1.lat) * t, lng: p1.lng + (p2.lng - p1.lng) * t }
}

function App() {
  const [open, setOpen] = useState(false)

  const [selectedAction, setSelectedAction] = useState(null)
  const [map, setMap] = useState(null)
  const marker = useRef(null)
  const [markerPosition, setMarkerPosition] = useState(null)
  const [lengthOfPolyline, setLengthOfPolyline] = useState(0)
  const [areaOfPolygon, setAreaOfPolygon] = useState(0)


  function subscribeGetLocation() {
    if (marker.current === null) {
      marker.current = new window.map4d.Marker({
        position: { lat: 0, lng: 0 },
        visible: false,
      })
      marker.current.setMap(map)
    }
    const event = map.addListener('click', (e) => {
      marker.current.setPosition(e.location)
      !marker.current.isVisible() && marker.current.setVisible(true)
      setMarkerPosition(e.location)
    })
    return () => {
      marker?.current?.setVisible(false)
      event.remove()
    }
  }

  function subscribeGetLengthOfPolyline() {
    const measure = new window.map4d.Measure([])
    let mouseMoveEvent = null
    let dblClickEvent = null
    const savedObjects = []
    const dataForDrawPolyline = {
      points: [],
      circles: [],
      polyline: new window.map4d.Polyline({
        path: [],
        strokeWidth: 2,
        strokeOpacity: 0.6,
      }),
      line: null,
      markerForLengthOfLine: null,
      markerForTotalLengthOfPolyline: null,
      isDraggingCircle: false,
      draggingCircle: null,
    }
    const event = map.addListener('click', e => {

      console.log('click event handle for draw polyline', e)
      dataForDrawPolyline.points.push(e.location)

      // create new marker for a new straight line segment
      if (dataForDrawPolyline.points.length > 1) {
        dataForDrawPolyline.polyline.setMap(map)
        if (dataForDrawPolyline.markerForLengthOfLine) {
          dataForDrawPolyline.markerForLengthOfLine.setMap(null)
        }
        // update polyline 
        dataForDrawPolyline.polyline.setPath(dataForDrawPolyline.points)


        measure.setPath(dataForDrawPolyline.points)
        let length = Math.round(measure.length * 100) / 100
        const mid = getMidpoint(dataForDrawPolyline.points)
        dataForDrawPolyline.markerForTotalLengthOfPolyline?.setMap(null)
        dataForDrawPolyline.markerForTotalLengthOfPolyline = new window.map4d.Marker({
          position: mid,
          iconView: `<span style="color: red; text-stroke: 4px #ffffff; text-shadow: -1px 0px 0px #ffffff, 0px 0px 0px #ffffff, 1px 0px 0px #ffffff, 0px -1px 0px #ffffff, 0px 1px 0px #ffffff; text-align: center;">${length} m</span>`,
        })
        dataForDrawPolyline.markerForTotalLengthOfPolyline.setMap(map)

      }
      // clear old line from map and create new line when mouse move
      dataForDrawPolyline.line?.setMap(null)
      dataForDrawPolyline.line = new window.map4d.Polyline({
        path: [],
        strokeWidth: 1,
        strokeColor: '#ffcc00',
        strokeOpacity: 1,
      })
      dataForDrawPolyline.line.setMap(map)

      dataForDrawPolyline.circles.forEach(circle => {
        circle.setMap(null)
      })

      // draw point
      dataForDrawPolyline.circles = []
      dataForDrawPolyline.points.forEach(point => {
        const circle = new window.map4d.Circle({
          center: point,
          radius: 1,
          fillColor: '#3085d6',
          strokeWidth: 2,
          strokeColor: '#FF0000',
        })
        circle.setMap(map)
        dataForDrawPolyline.circles.push(circle)
      })

      if (mouseMoveEvent === null) {
        mouseMoveEvent = map.addListener('mouseMove', e => {
          if (dataForDrawPolyline.isDraggingCircle) {
            return
          }
          console.log('mouseMove event handle for draw polyline...');
          const endPoint = dataForDrawPolyline.points[dataForDrawPolyline.points.length - 1]
          dataForDrawPolyline.line.setPath([endPoint, e.location])
          const center = {
            lat: (endPoint.lat + e.location.lat) / 2,
            lng: (endPoint.lng + e.location.lng) / 2
          }

          measure.setPath([endPoint, e.location])
          let length = Math.round(measure.length * 100) / 100
          dataForDrawPolyline.markerForLengthOfLine?.setMap(null)
          dataForDrawPolyline.markerForLengthOfLine = new window.map4d.Marker({
            position: center,
            iconView: `<span style="color: red; text-stroke: 4px #ffffff; text-shadow: -1px 0px 0px #ffffff, 0px 0px 0px #ffffff, 1px 0px 0px #ffffff, 0px -1px 0px #ffffff, 0px 1px 0px #ffffff; text-align: center;">${length} m</span>`,
            label: measure.length + 'm'
          })
          dataForDrawPolyline.markerForLengthOfLine.setMap(map)

          measure.setPath([...dataForDrawPolyline.points, e.location])
          setLengthOfPolyline(Math.round(measure.length * 100) / 100)
        })
        dataForDrawPolyline.line.setMap(map)
      }
      if (dblClickEvent === null) {

        dblClickEvent = map.addListener('dblClick', e => {
          // click + click = dblClick so we need to remove end element of array
          dataForDrawPolyline.points.pop()
          dataForDrawPolyline.circles.pop()?.setMap(null)

          mouseMoveEvent?.remove()
          mouseMoveEvent = null
          if (dataForDrawPolyline.points.length < 2) {
            return
          }
          dataForDrawPolyline.polyline.setPath(dataForDrawPolyline.points)
          savedObjects.push(dataForDrawPolyline.polyline)
          savedObjects.push(...dataForDrawPolyline.circles)
          savedObjects.push(dataForDrawPolyline.markerForTotalLengthOfPolyline)

          // set relationship
          dataForDrawPolyline.circles.forEach(circle => {
            circle.belongTo = dataForDrawPolyline.polyline
          })
          dataForDrawPolyline.polyline.hasManyCircles = dataForDrawPolyline.circles
          dataForDrawPolyline.polyline.markerForTotalLength = dataForDrawPolyline.markerForTotalLengthOfPolyline

          dataForDrawPolyline.polyline = new window.map4d.Polyline({
            path: [],
            strokeWidth: 2,
            strokeOpacity: 0.6,
          })
          dataForDrawPolyline.circles = []
          dataForDrawPolyline.markerForTotalLengthOfPolyline = null
          dataForDrawPolyline.markerForLengthOfLine = null
          dataForDrawPolyline.points = []
        }, mapEventOptions)
      }

      measure.setPath(dataForDrawPolyline.points)
      setLengthOfPolyline(Math.round(measure.length * 100) / 100)


    }, mapEventOptions)

    // dragg circle to modify polyline
    const longClickEvent = map.addListener('longClick', e => {
      console.log('longClick event handle for dragging circle...');
      dataForDrawPolyline.isDraggingCircle = true
      dataForDrawPolyline.draggingCircle = e.circle
      e.circle.setFillColor('#ffcc00')
    }, mapEventOptions)

    const draggEvent = map.addListener('drag', e => {
      if (dataForDrawPolyline.isDraggingCircle) {
        map.setScrollGesturesEnabled(false)
        const circle = dataForDrawPolyline.draggingCircle
        const polyline = circle.belongTo
        const path = polyline.getPath()
        const index = polyline.hasManyCircles.findIndex(_circle => _circle === circle)
        circle.setCenter(e.location)
        path[index] = e.location
        polyline.setPath(path)

        measure.setPath(path)
        let length = Math.round(measure.length * 100) / 100
        const marker = polyline.markerForTotalLength
        marker.setPosition(getMidpoint(path))
        marker.setIconView(`<span style="color: red; text-stroke: 4px #ffffff; text-shadow: -1px 0px 0px #ffffff, 0px 0px 0px #ffffff, 1px 0px 0px #ffffff, 0px -1px 0px #ffffff, 0px 1px 0px #ffffff; text-align: center;">${length} m</span>`)
      }
    }, {})

    const draggEndEvent = map.addListener('dragEnd', e => {
      if (dataForDrawPolyline.isDraggingCircle) {
        dataForDrawPolyline.draggingCircle.setFillColor('#3085d6')
        dataForDrawPolyline.isDraggingCircle = false
        dataForDrawPolyline.draggingCircle = null
        map.setScrollGesturesEnabled(true)
      }
    })
    return () => {
      event.remove()
      longClickEvent.remove()
      draggEndEvent.remove()
      draggEvent?.remove()
      mouseMoveEvent?.remove()
      dblClickEvent?.remove()
      dataForDrawPolyline.line?.setMap(null)
      dataForDrawPolyline.polyline?.setMap(null)
      dataForDrawPolyline.circles?.forEach(circle => circle.setMap(null))
      savedObjects.forEach(object => object.setMap(null))
    }
  }

  function subscribeGetAreaOfPolygon() {
    let mouseMoveEvent = null
    let dblClickEvent = null

    const measure = new window.map4d.Measure([])
    const savedObjects = []

    const dataForDrawPolygon = {
      points: [],
      circles: [],
      polygon: new window.map4d.Polygon({
        fillOpacity: 0.1,
        userInteractionEnabled: true,
        paths: [[]]
      }),
      markerForAreaOfPolygon: null,
      isDraggingCircle: false,
      draggingCircle: null,
    }

    const event = map.addListener('click', e => {

      dataForDrawPolygon.circles.forEach(circle => {
        circle.setMap(null)
      })

      if (dataForDrawPolygon.polygon !== null) {
        dataForDrawPolygon.polygon.setMap(null)
      }
      dataForDrawPolygon.points.push(e.location)
      dataForDrawPolygon.polygon.setPaths([dataForDrawPolygon.points.concat(dataForDrawPolygon.points[0])])

      dataForDrawPolygon.polygon.setMap(map)

      // draw point
      dataForDrawPolygon.circles = dataForDrawPolygon.points.map(point => {
        const circle = new window.map4d.Circle({
          center: point,
          radius: 1,
          strokeWidth: 2,
          strokeColor: '#FF0000',
        })
        circle.setMap(map)
        return circle
      })

      if (mouseMoveEvent === null) {
        mouseMoveEvent = map.addListener('mouseMove', e => {
          const points = dataForDrawPolygon.points.concat(e.location, dataForDrawPolygon.points[0])

          dataForDrawPolygon.polygon.setPaths([points])
          if (points.length > 3) {
            measure.setPath(points)
            const area = Math.round(measure.area * 100) / 100
            const center = measure.center

            dataForDrawPolygon.markerForAreaOfPolygon?.setMap(null)
            dataForDrawPolygon.markerForAreaOfPolygon = new window.map4d.Marker({
              position: center,
              anchor: [0, 0],
              iconView: `<span style="color: red; text-stroke: 4px #ffffff; text-shadow: -1px 0px 0px #ffffff, 0px 0px 0px #ffffff, 1px 0px 0px #ffffff, 0px -1px 0px #ffffff, 0px 1px 0px #ffffff; text-align: center;">${area} m2</span>`,
            })
            dataForDrawPolygon.markerForAreaOfPolygon.setMap(map)
          }
        })
      }

      if (dblClickEvent === null) {
        dblClickEvent = map.addListener('dblClick', e => {
          dataForDrawPolygon.points.pop()
          dataForDrawPolygon.circles.pop()?.setMap(null)

          mouseMoveEvent.remove()
          dblClickEvent.remove()
          mouseMoveEvent = null
          dblClickEvent = null
          const points = dataForDrawPolygon.points.concat(dataForDrawPolygon.points[0])
          dataForDrawPolygon.polygon.setPaths([points])
          dataForDrawPolygon.points = []
          measure.setPath(points)
          setAreaOfPolygon(Math.round(measure.area * 100) / 100)

          console.log(dataForDrawPolygon.polygon.getPaths());

          savedObjects.push(dataForDrawPolygon.polygon)
          savedObjects.push(...dataForDrawPolygon.circles)
          savedObjects.push(dataForDrawPolygon.markerForAreaOfPolygon)

          // save relationship objects
          dataForDrawPolygon.polygon.hasManyCircles = dataForDrawPolygon.circles
          dataForDrawPolygon.circles.forEach(circle => circle.belongTo = dataForDrawPolygon.polygon)
          dataForDrawPolygon.polygon.markerForArea = dataForDrawPolygon.markerForAreaOfPolygon

          dataForDrawPolygon.polygon = new window.map4d.Polygon({
            fillOpacity: 0.1,
            userInteractionEnabled: true,
            paths: [[]]
          })
          dataForDrawPolygon.circles = []
          dataForDrawPolygon.markerForAreaOfPolygon = null
        }, mapEventOptions)
      }

    }, mapEventOptions)


    // dragg circle to modify polygon
    const longClickEvent = map.addListener('longClick', e => {
      dataForDrawPolygon.isDraggingCircle = true
      dataForDrawPolygon.draggingCircle = e.circle
      e.circle.setFillColor('#ffcc00')
    }, { circle: true })
    const draggEvent = map.addListener('drag', e => {
      if (dataForDrawPolygon.isDraggingCircle) {
        map.setScrollGesturesEnabled(false)
        const circle = dataForDrawPolygon.draggingCircle
        const polygon = circle.belongTo
        const path = polygon.getPaths()
        circle.setCenter(e.location)
        const index = polygon.hasManyCircles.findIndex(_circle => _circle === circle)

        if(index === 0){
          path[0][0] = e.location
          path[0][path[0].length - 1] = e.location
        } else {
          path[0][index] = e.location
        }

        polygon.setPaths(path)
        measure.setPath(path[0])
        const area = Math.round(measure.area * 100) / 100
        const center = measure.center
        polygon.markerForArea.setPosition(center)
        polygon.markerForArea.setIconView(`<span style="color: red; text-stroke: 4px #ffffff; text-shadow: -1px 0px 0px #ffffff, 0px 0px 0px #ffffff, 1px 0px 0px #ffffff, 0px -1px 0px #ffffff, 0px 1px 0px #ffffff; text-align: center;">${area} m2</span>`)
      }
    })

    const draggEndEvent = map.addListener('dragEnd', e => {
      if(dataForDrawPolygon.isDraggingCircle){
        map.setScrollGesturesEnabled(true)
        dataForDrawPolygon.draggingCircle.setFillColor('#3085d6')
        dataForDrawPolygon.isDraggingCircle = false
        dataForDrawPolygon.draggingCircle = null
      }
    })

    return () => {
      event.remove()
      longClickEvent.remove()
      draggEvent.remove()
      draggEndEvent.remove()
      mouseMoveEvent?.remove()
      dblClickEvent?.remove()
      dataForDrawPolygon.polygon.setMap(null)
      dataForDrawPolygon.circles.forEach(circle => circle.setMap(null))
      savedObjects.forEach(object => object?.setMap(null))
    }
  }

  useEffect(() => {
    if (map === null) return
    if (selectedAction === 2)
      return subscribeGetLocation()
    if (selectedAction === 3)
      return subscribeGetLengthOfPolyline()
    if (selectedAction === 4)
      return subscribeGetAreaOfPolygon()

  }, [map, selectedAction])

  const onMapReady = (map, id) => {
    window.map = map
    setMap(map)
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
            <ToggleButtonGroup color='standard' variant="text" aria-label="text button group"
              value={selectedAction}
              exclusive
              onChange={(e, action) => { setSelectedAction(action) }}>
              <ToggleButton value={1}><RemoveRedEyeRoundedIcon /></ToggleButton>
              <ToggleButton value={2}>
                <NearMeRoundedIcon />
              </ToggleButton>
              <ToggleButton value={3}>
                <Tooltip title='Đo khoảng cách' arrow>
                  <DesignServicesRoundedIcon />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value={4}><SelectAllRoundedIcon /></ToggleButton>
            </ToggleButtonGroup>
          </Toolbar>
        </AppBar>
        <Drawer
          sx={{
            width: drawerWidth,
            position: 'relative',
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
        <Box sx={{ marginLeft: open ? drawerWidth + 10 + 'px' : 0, position: 'relative', mt: 12, bgcolor: 'red' }}>
          <Box sx={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            p: 1,
            top: 10,
            right: 10,
            height: 100,
            width: 200,
            borderRadius: 1,
            bgcolor: 'white',
            zIndex: 10,
          }}>
            {selectedAction === 2 && <>
              <div>lat: {markerPosition?.lat}</div>
              <div>lng: {markerPosition?.lng}</div>
            </>}
            {selectedAction === 3 && <>
              <div>length: {lengthOfPolyline}</div>
            </>}
            {selectedAction === 4 && <>
              <div>area: {areaOfPolygon}</div>
            </>}
          </Box>
          <Map4dMap
            key="map4d"
            id="map4d"
            onMapReady={onMapReady}
            options={{
              cooperativeGestures: false,
              center: { lat: 16.0721634, lng: 108.226905 },
              zoom: 15
            }}
            accessKey="b77745a2eb604d0989e2b5648d0019b2"
            version="2.1" />
        </Box>

      </Box>
    </ThemeProvider>
  );
}

export default App;
