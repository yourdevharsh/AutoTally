import React, { useState } from 'react';
import { Text, View, Button, TextInput, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';


const API_URL = '';

const App = () => {
    const [selectedFields, setFields] = useState('Total Amount, Date, Store Name');
    const [isLoading, setIsLoading] = useState(false);

    const startProcess = async () => {
        const arrFields = selectedFields
            .split(',')
            .map(field => field.trim())
            .filter(field => field.length > 0);

        if (arrFields.length === 0) {
            Alert.alert('Error', 'Please enter the fields you want to extract, separated by commas.');
            return;
        }

        // Step 1: Launch Image Picker
        launchImageLibrary({
            mediaType: 'photo',
            quality: 0.8,
            selectionLimit: 0, // 0 for multi-select
        }, async (pickerResponse) => {
            if (pickerResponse.didCancel) {
                console.log('User cancelled image picker');
                return;
            }
            if (pickerResponse.errorCode) {
                console.log('ImagePicker Error: ', pickerResponse.errorMessage);
                Alert.alert('Error', 'Failed to pick images. Please try again.');
                return;
            }

            const assets = pickerResponse.assets;
            if (assets && assets.length > 0) {
                setIsLoading(true);

                // Step 2: Prepare a FormData object
                const data = new FormData();
                data.append('fields', selectedFields);

                assets.forEach((asset, index) => {
                    data.append('photos', {
                        uri: asset.uri,
                        name: asset.fileName,
                        type: asset.type,
                    });
                });

                // Step 3: Send the request to the backend
                try {
                    const response = await fetch(API_URL, {
                        method: 'POST',
                        body: data,
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || `Server responded with status: ${response.status}`);
                    }

                    // Step 4: Handle the Excel file response
                    const blob = await response.blob();
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = () => {
                        const base64data = reader.result;
                        const fileName = `AutoTally-Export-${Date.now()}.xlsx`;
                        const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

                        // Save the file to the device
                        RNFS.writeFile(filePath, base64data.split(',')[1], 'base64')
                            .then(() => {
                                // Open the share dialog to save or open the file
                                Share.open({
                                    url: `file://${filePath}`,
                                    title: 'Open Excel File',
                                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                                })
                                    .catch(err => console.log(err));
                            })
                            .catch(err => {
                                console.error(err);
                                Alert.alert('Error', 'Failed to save the Excel file.');
                            });
                    };

                } catch (e) {
                    console.error(e);
                    Alert.alert('Upload Failed', e.message);
                } finally {
                    setIsLoading(false);
                }
            }
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>AutoTally 📊</Text>
            <Text style={styles.subtitle}>Extract data from bills into Excel.</Text>
            <TextInput
                style={styles.input}
                placeholder='e.g., Total Amount, Date, Store Name'
                onChangeText={setFields}
                value={selectedFields}
            />
            <Button
                title={isLoading ? 'Processing...' : 'Select Images and Start'}
                onPress={startProcess}
                disabled={isLoading}
            />
            {isLoading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: 'gray',
        marginBottom: 20,
    },
    input: {
        height: 50,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    loader: {
        marginTop: 20,
    }
});

export default App;