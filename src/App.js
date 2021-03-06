import React, { Component } from 'react';
import Particles from 'react-particles-js';

import Navigation from './components/Navigation/Navigation';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Rank from './components/Rank/Rank';
import './App.css';

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

const initialState = {
	input: '',
	imageURL: '',
	box: {},
	route: 'signin',
	isSignedIn: false,
	user: {
		id: '',
		name: '',
		email: '',
		entries: 0,
		joined: ''
	}
};

class App extends Component {
	constructor() {
		super();

		this.state = initialState;
	}

	loadUser = (data) => {
		this.setState({
			id: data.id,
			name: data.name,
			email: data.email,
			entries: data.entries,
			joined: data.joined
		});
	};

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
		this.setState({imageURL: this.state.input});					
		fetch('https://glacial-escarpment-62383.herokuapp.com/imageurl', {
			method: 'post',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				input: this.state.input
			})
		  })
		  .then(response => response.json())
		  .then(response => {
			if (response) {
			  fetch('https://glacial-escarpment-62383.herokuapp.com/image', {
				method: 'put',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({
				  id: this.state.id
				})
			  })
				.then(res => res.json())
				.then(count => {
				  this.setState({entries: count})
				})
				.catch(console.log);	
			}
			this.displayFaceBox(this.calculateFaceLocation(response))
		  })
		  .catch(err => console.log(err));
	  }

	onRouteChange = (route) => {
		if (route === 'signin') {
			this.setState(initialState);
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
						<Rank name={this.state.name} entries={this.state.entries} />
						<ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
						<FaceRecognition imageURL={imageURL} box={box} />
					</div>
				) : route === 'signin' ? (
					<Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
				) : (
					<Register onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
				)}
			</div>
		);
	}
}

export default App;
