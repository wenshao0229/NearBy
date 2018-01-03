import React from 'react';
import $ from 'jquery';
import { Tabs, Spin } from 'antd';
import {GEO_OPTIONS, POS_KEY, API_ROOT, AUTH_PREFIX} from '../constants';
import { Gallery } from './Gallery';
import { CreatePostButton } from './CreatePostButton';

const TabPane = Tabs.TabPane;

export class Home extends React.Component {
    state = {
        posts: [],
        error: '',
        loadingPosts: false,
        loadingGeoLocation: false,

    }
    componentDidMount() {
        if ("geolocation" in navigator) {
            this.setState({loadingGeoLocation: true});
            navigator.geolocation.getCurrentPosition(
                this.onSuccessLoadGeoLocation,
                this.onFailedLoadGeoLocation,
                GEO_OPTIONS,
            )
        } else {
            this.setState({error: 'Your browser does not support geo location!'});
        };

    }

    onSuccessLoadGeoLocation = (position) => {
        console.log(position);
        this.setState({loadingGeoLocation: false, error: ''});
        const {latitude: lat, longitude: lon} = position.coords;
        localStorage.setItem(POS_KEY, JSON.stringify({ lat: lat, lon: lon }));
        this.loadNearbyPosts();

    }

    onFailedLoadGeoLocation = () => {
        this.setState({loadingGeoLocation: false, error:'Failed to load geo location'});
    }

    getGalleryPanelContent = () => {
        if (this.state.error) {
            return <div> Has error </div>;
        } else if (this.state.loadingGeoLocation) {
            return <Spin tip="Loading Geo Location..."/>;
        } else if (this.state.loadingPosts) {
            return <Spin tip="Loading Posts..."/>;
        } else if (this.state.posts) {
            const images = this.state.posts.map((post) => {
                return {
                    user: post.user,
                    src: post.url,
                    thumbnail: post.url,
                    thumbnailWidth: 400,
                    thumbnailHeight: 300,
                    caption: post.message,
                };
            });
            console.log(images);
            return (
                <Gallery images={images}/>
            );
        }
        return <div>There has no nearby post</div>;
    }

    loadNearbyPosts = () => {
        const { lat, lon } = JSON.parse(localStorage.getItem('POS_KEY'));
        this.setState({ loadingPosts: true });
        return $.ajax({
            url: `${API_ROOT}/search?lat=${lat}&lon=${lon}&range=20`,
            method: 'GET',
            headers: {
                Authorization: `${AUTH_PREFIX} ${localStorage.getItem('TOKEN_KEY')}`,
            },
        }).then((response) => {
            console.log(response);
            this.setState({ loadingPosts: false, posts: response, error: '' });
        }, (error) => {
            this.setState({ loadingPosts: false, error: error.responseText });
        }).catch((error) => {
            this.setState({ error: error });
        });
    }

    render() {
        const createPostButton = <CreatePostButton loadNearbyPosts={this.loadNearbyPosts}/>;
        return (
            <Tabs tabBarExtraContent={createPostButton} className="main-tabs">
                <TabPane tab="Posts" key="1">
                    {this.getGalleryPanelContent()}
                </TabPane>
                <TabPane tab="Map" key="2">
                    content 2
                </TabPane>
            </Tabs>
        );
    }
}