import React from 'react';
import { withScriptjs, withGoogleMap, GoogleMap } from 'react-google-maps';
import { AroundMarker } from './AroundMarker';

class AroundMap extends React.Component {
    getMapRef = (map) => {
        this.map = map;
    }

    onDragEnd = () => {
        const center = this.map.getCenter();
        const position = { lat: center.lat(), lon: center.lng() };
        this.props.loadNearbyPosts(position);
    }

    render() {
        const position = JSON.parse(localStorage.getItem('POS_KEY'));
        return (
            <GoogleMap
                onDragEnd={this.onDragEnd}
                ref={this.getMapRef}
                defaultZoom={11}
                defaultCenter={{lat: position.lat, lng: position.lon}}
            >
                {this.props.posts ? this.props.posts.map((post, index) =>
                       <AroundMarker
                           key={`${index}-${post.user}-${post.url}`}
                           post={post}
                       />
                ) : null}

            </GoogleMap>
        );
    }
}

export const WrappedAroundMap = withScriptjs(withGoogleMap(AroundMap));