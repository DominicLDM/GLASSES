import React, { useEffect, useState, useContext } from "react";
import { StyleSheet, Text, View, SectionList, TouchableOpacity, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import SettingList from "../context/setting-data.jsx";

const Settings = () => {
  const { settings, changeSetting, resetSettings, setSettings } = useContext(SettingList);
	
	const [ tempSettings, setTempSettings ] = useState(settings);
  const [ tempEdit, setTempEdit ] = useState(false);
	const [ showDetail, setShowDetail ] = useState(null);

  function updateTempSettings() {
    //setTempSettings(settings);
  }

  useEffect(() => {
    var temp = false;
    Object.keys(tempSettings).forEach((key) => {temp = temp || (tempSettings[key]!=settings[key])});
    setTempEdit(temp);
  }, [ tempSettings ]);

  const settingDisplay = [
		{title: 'Music Detection', data:
			[{setting: "refresh", title: 'refresh rate', type: 'num-input', detail: "How often the glasses will take a new clip to detect a change in the song (seconds)."},
			]},
		{title: 'Display', data:
			[{setting: 'textSize', title: 'large text', type: 'checkbox', detail: 'Increases the size of the text displayed on the glasses.'},
			]},
		{title: 'Other', data:
			[{setting: "lowPow", title: 'low power mode', type: 'checkbox', detail: 'Reduces certain functionalities in order to save battery.'},
       {setting: "lowData", title: 'data saving mode', type: 'checkbox', detail: 'Does not download album covers for display.'},
  ]}];
    
  return (
		<SectionList
			bounces={false}
			backgroundColor="#262626"
			showsVerticalScrollIndicator={false}
			decelerationRate={0.97}
			indicatorStyle="white"
			stickySectionHeadersEnabled={false}
			sections={settingDisplay}
			data={settingDisplay}
			extraData={tempSettings}
			renderItem={({ item }) => {
				return (
					<View>
						<View style={styles.settingRow}>
							<View style={{flex: 1, flexDirection: "row", alignItems: 'center'}}><Text style={styles.settingText}>{item.title} </Text>
								{item.detail ? <TouchableOpacity onPress={() => {setShowDetail(showDetail == item.title ? null : item.title)}}><Feather style={styles.settingIcon} name='help-circle'/></TouchableOpacity> : <></>}
								{item.type == 'to-page' ? <TouchableOpacity><Feather style={styles.settingIcon} name='arrow-right'/></TouchableOpacity> : <></>}
								{item.type == 'checkbox' ? <TouchableOpacity activeOpacity={0.6} onPressOut={() => {setTempSettings({...tempSettings, [item.setting ?? item.title]: !tempSettings[item.setting ?? item.title]})}}><Feather style={styles.settingIcon} name={tempSettings[item.setting ?? item.title] == false ? "square" : "check-square"}/></TouchableOpacity> : <></>}
							</View>
							
							{item.type == 'num-input' ? <View style={{flex: 0.6}}><TextInput value={`${tempSettings[item.setting ?? item.title]}`} onChangeText={(text) => {setTempSettings({...tempSettings, [item.setting ?? item.title]: text})}} maxLength={6} keyboardAppearance={tempSettings.darkMode ? "dark" : "light"} inputMode='decimal' style={styles.numInput}></TextInput></View> : <></>}
							
						</View>
						{showDetail == item.title ? <Text style={styles.text}>{item.detail}</Text> : <></>}
					</View>
				);
			}}
			renderSectionHeader={({section: {title}}) => (
				<View style={{height: 60}}>
					<View style={styles.sectionBox}>
						<Text style={styles.sectionTitle}>{title}</Text>
					</View>
				</View>
			)}
			renderSectionFooter={() => (<View style={{height: 15,}}/>)}
			ListHeaderComponent={
				<View style={{}}>
					<Text style={{...styles.headerText, marginBottom: 14,}}>SETTINGS</Text>
          <View style={{...styles.sectionBox, marginBottom: 5, marginTop: 0,}}>
					<TouchableOpacity disabled={!tempEdit} onPress={() => {setSettings(tempSettings);}}><Feather name="save" style={tempEdit ? styles.icon : {...styles.icon, opacity: 0.4}}/></TouchableOpacity>
					<TouchableOpacity disabled={!tempEdit} onPress={() => {setTempSettings(settings);}}><Feather name="refresh-cw" style={tempEdit ? styles.icon : {...styles.icon, opacity: 0.4}}/></TouchableOpacity>
				</View>
				</View>
			}
			contentContainerStyle={{flexGrow: 1,}}
		/>
	);
}


const styles = StyleSheet.create({
  container: {
    display: "flex",
    height: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 36,
    backgroundColor: "#262626"
  },
  
  headerText: {
    fontSize: 70,
    color: "#ACBFA4",
    marginVertical: 30,
    alignSelf: "center",
    fontFamily: "Didot",
    borderBottomWidth: 1,
    borderColor: "#ACBFA4",
  },

  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 35,
    paddingHorizontal: 25,
  },

  settingText: {
    fontSize: 16,
    color: "#ACBFA4",
    opacity: 0.8,
  },

  settingIcon: {
    fontSize: 16,
    color: '#ACBFA4',
    padding: 7,
    opacity: 0.8,
  },

  sectionBox: {
    height: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: "row",
  },

  sectionTitle: {
    color: "#ACBFA4",
    fontFamily: "Didot",
    flex: 1,
    fontSize: 22,
    textTransform: "uppercase",
  },

  numInput: {
    backgroundColor: 'white',
    width: 60,
    height: 25,
    borderWidth: 1.5,
    borderColor: "#ACBFA4",
    padding: 3,
  },

  text: {
    fontSize: 15,
    fontFamily: "OpenSans",
    color: "black",
    backgroundColor: "#ACBFA4",
    opacity: 1,
    padding: 9,
    margin: 8,
    marginHorizontal: 16,
    opacity: 0.5,
    borderWidth: 2,
    borderRadius: 5,
    borderColor: "#ACBFA4",
  },

  icon: {
    fontSize: 23,
    color: "#ACBFA4",
    marginHorizontal: 30,
  },
});

export default Settings