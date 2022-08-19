import React from 'react';

export function addLibrary(url, id) {
  let scriptId = `script_${id}`
  let exist = document.getElementById(scriptId)
  if (exist) {
    return null
  }
  const script = document.createElement('script')
  script.src = url;
  script.defer = true;
  script.id = scriptId
  document.body.appendChild(script)
  return script
}

class Map4dMap extends React.Component {
  constructor(props) {
    super(props)
    if (props.id == null || props.id == "") {
      console.warn('Prop `id` is null or empty, map might work NOT correctly')
    }
    this.mapKey = props.id || "default"       
    this.callback = `callback_${this.mapKey}`    
    this.setMapDomRef = this.setMapDomRef.bind(this)
  }

  setMapDomRef(e) {    
    this.mapDomRef = e
  }

  componentWillUnmount() {  
    this.destroy()
  }

  destroy() {
    delete window[this.callback]  
    if (this.scriptElement != null) {
      this.scriptElement.remove()
    }
    this.mapRef && this.mapRef.destroy()
    this.url = null
  }

  createCallback() {
    window[this.callback] = () => {
      if (this.mapDomRef) {
        let options = this.props.options
        this.mapRef = new window.map4d.Map(this.mapDomRef, options)
        if (this.props.onMapReady) {
          this.props.onMapReady(this.mapRef, this.mapKey)
        }
      } else {
        console.error(`Map4dMap: map element is NOT found`)
      }
    }
  }

  render() {    
    let url = `https://api.map4d.vn/sdk/map/js?version=${this.props.version}&key=${this.props.accessKey}&callback=${this.callback}`    
    if (this.props.mapid) {
      url += `&mapId=${this.props.mapid}`
    }
    if (url != this.url) {
      this.destroy()
      this.createCallback()
      let script = addLibrary(url, this.mapKey)
      if (script) {
        this.scriptElement = script
      }
    }    
    this.url = url
    return (
      <div 
      style={{width: '100%', height: '100vh', display: 'block'}} 
      id={`${this.mapKey}`} 
      ref={this.setMapDomRef}>
      </div>
    );
  }
}

export default Map4dMap;