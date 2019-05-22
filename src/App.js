import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';

import Navigation from './components/Navigation/Navigation';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Rank from './components/Rank/Rank';
import './App.css';

const app = new Clarifai.App({
	apiKey: 'c5edf63c49ad476a83ae66737f523e27'
});

const particlesOptions = {
	particles: {
		number: {
			value: 70,
			density: {
				enable: true,
				value_area: 800
			}
		},
		line_linked: {
			shadow: {
				enable: true,
				color: '#3CA9DA1',
				blur: 5
			}
		}
	}
};

class App extends Component {
	constructor() {
		super();

		this.state = {
			input: '',
			imageURL: '',
			box: {},
			route: 'signin',
			isSignedIn: false
		};
	}

	calculateFaceLocation = (data) => {
		const clarifyFace = data.outputs[0].data.regions[0].region_info.bounding_box;
		const image = document.getElementById('inputimage');

		const width = Number(image.width);
		const height = Number(image.height);

		return {
			leftCol: clarifyFace.left_col * width,
			topRow: clarifyFace.top_row * height,
			rightCol: width - clarifyFace.right_col * width,
			bottomRow: height - clarifyFace.bottom_row * height
		};
	};

	displayFaceBox = (box) => {
		this.setState({ box });
	};

	onInputChange = (event) => {
		this.setState({ input: event.target.value });
	};

	onButtonSubmit = () => {
		this.setState({ imageURL: this.state.input });
		app.models
			.predict(
				Clarifai.FACE_DETECT_MODEL,
				// URL
				this.state.input
			)
			.then((response) => this.displayFaceBox(this.calculateFaceLocation(response)))
			.catch((err) => console.log(err));
	};

	onRouteChange = (route) => {
		if (route === 'signin') {
			this.setState({ isSignedIn: false });
		} else if (route === 'home') {
			this.setState({ isSignedIn: true });
		}
		this.setState({ route });
	};

	render() {
		const { isSignedIn, imageURL, route, box } = this.state;

		return (
			<div className="App">
				<Particles className="particles" params={particlesOptions} />
				<Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
				{route === 'home' ? (
					<div>
						<Logo />
						<Rank />
						<ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
						<FaceRecognition box={box} imageURL={imageURL} />
					</div>
				) : route === 'signin' ? (
					<Signin onRouteChange={this.onRouteChange} />			
				) : (
					<Register onRouteChange={this.onRouteChange} />	
					
				)}	
			</div>
		);
	}
}

export default App;
