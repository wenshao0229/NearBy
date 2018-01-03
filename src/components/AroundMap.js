import React from 'react';
import { withScriptjs, withGoogleMap, GoogleMap, Marker, InfoWindow } from 'react-google-maps';

class AroundMap extends React.Component {
    state = {
        isOpen: false,
    }

    onToggleOpen = () => {
        this.setState(
            (prevState) => ({ isOpen: !prevState.isOpen })
        )
    }

    render() {
        const {lat, lon} = JSON.parse(localStorage.getItem('POS_KEY'));
        return (
            <GoogleMap
                defaultZoom={10}
                defaultCenter={{lat: lat, lng: lon}}
            >
                <Marker
                    position={{lat: lat, lng: lon}}
                    onClick={this.onToggleOpen}
                >
                    {this.state.isOpen ?
                        <InfoWindow onClick={this.onToggleOpen}>
                            <div>this is test</div>
                        </InfoWindow> : null}
                </Marker>
            </GoogleMap>
        );
    }
}

export const WrappedAroundMap = withScriptjs(withGoogleMap(AroundMap));