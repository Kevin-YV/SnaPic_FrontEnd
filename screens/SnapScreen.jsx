import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector } from 'react-redux';
import { addPics } from '../reducers/user';

export default function SnapScreen() {
	const dispatch = useDispatch();
	const isFocused = useIsFocused();
	const [hasPermission, setHasPermission] = useState(null);
	const [type, setType] = useState(CameraType.back);
	const [flashMode, setFlashMode] = useState(FlashMode.off);
	const cameraRef = useRef(null);

	useEffect(() => {
		(async () => {
			const { status } = await Camera.requestCameraPermissionsAsync();
			setHasPermission(status === 'granted');
		})();
	}, []);

	if (hasPermission === null || !isFocused) {
		return <View />;
	}

	const takePicture = async () => {
		const photo = await cameraRef.current.takePictureAsync({ quality: 0.4 });

		const formData = new FormData();

		formData.append('photoFromFront', {
			uri: photo.uri,
			name: 'photo.jpg',
			type: 'image/jpeg',
		});

		fetch('http://10.75.15.137:5000/upload', {
			method: 'POST',
			body: formData,
		})
			.then((res) => res.json())
			.then((data) => data.result && dispatch(addPics(data.url)));
	};

	return (
		<Camera
			type={type}
			flashMode={flashMode}
			ref={cameraRef}
			style={styles.container}
		>
			<View style={styles.buttonsContainer}>
				<TouchableOpacity
					style={styles.button}
					onPress={() =>
						setType(
							type === CameraType.back ? CameraType.front : CameraType.back
						)
					}
				>
					<FontAwesome
						name='rotate-right'
						size={25}
						color='#fff'
					/>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.button}
					onPress={() =>
						setFlashMode(
							flashMode === FlashMode.off ? FlashMode.on : FlashMode.off
						)
					}
				>
					<FontAwesome
						name='flash'
						size={25}
						color={flashMode === FlashMode.on ? '#e8be4b' : '#fff'}
					/>
				</TouchableOpacity>
			</View>
			<View style={styles.snapContainer}>
				<TouchableOpacity onPress={() => takePicture()}>
					<FontAwesome
						name='circle-thin'
						size={90}
						color='#fff'
					/>
				</TouchableOpacity>
			</View>
		</Camera>
	);
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	buttonsContainer: {
		flex: 0.1,
		paddingTop: 20,
		flexDirection: 'row',
		alignItems: 'flex-end',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
	},
	button: {
		width: 44,
		height: 44,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(250,0,0,0.2)',
		borderRadius: 50,
	},
	snapContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'flex-end',
		paddingBottom: 25,
	},
});
