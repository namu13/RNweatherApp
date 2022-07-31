import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./colors";

const TODO_STORAGE_KEY = "@toDos";
const WORKING_STORAGE_KEY = "@working";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorking();
    loadToDos();
  }, []);

  const travel = async () => {
    setWorking(false);
    saveWorking(false);
  };
  const work = async () => {
    setWorking(true);
    saveWorking(true);
  };

  const changeComplecity = async (key) => {
    const newToDos = { ...toDos };
    newToDos[key].complete = !newToDos[key].complete;
    setToDos(newToDos);
    await saveToDos(newToDos);
  };

  const saveWorking = async (working) => {
    await AsyncStorage.setItem(WORKING_STORAGE_KEY, JSON.stringify(working));
  };

  const loadWorking = async () => {
    const working = await AsyncStorage.getItem(WORKING_STORAGE_KEY);
    setWorking(JSON.parse(working));
  };

  const onChangeText = (payload) => setText(payload);

  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(toSave));
  };
  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(TODO_STORAGE_KEY);
    await setTimeout(() => {
      setLoading(false);
    }, 1000);

    setToDos(JSON.parse(s));
  };
  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, complete: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };

  const deleteToDo = async (key) => {
    Alert.alert("Delete To Do", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Yes",
        onPress: () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          saveToDos(newToDos);
        },
      },
    ]);
  };
  return (
    <View style={styles.container}>
      <StatusBar style="inverted" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{ ...styles.btnText, color: working ? theme.grey : "white" }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          onSubmitEditing={addToDo}
          onChangeText={onChangeText}
          returnKeyType="done"
          autoCapitalize="none"
          autoCorrect={false}
          value={text}
          placeholder={working ? "Add a To Do" : "Where do you want to go?"}
          style={styles.input}
        />
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" style={styles.loading} />
        </View>
      ) : (
        <ScrollView>
          {Object.keys(toDos).map((key) =>
            toDos[key].working === working ? (
              <View style={styles.toDo} key={key}>
                <TouchableOpacity onPress={() => changeComplecity(key)}>
                  {toDos[key].complete ? (
                    <MaterialCommunityIcons
                      name="checkbox-marked"
                      size={24}
                      color="white"
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="checkbox-blank"
                      size={24}
                      color="white"
                    />
                  )}
                </TouchableOpacity>
                <View style={styles.toDoContainer}>
                  {toDos[key].complete ? (
                    <Text
                      style={{
                        ...styles.toDoText,
                        color: theme.textGray,
                        textDecorationLine: "line-through",
                      }}
                    >
                      {toDos[key].text}
                    </Text>
                  ) : (
                    <Text style={styles.toDoText}>{toDos[key].text}</Text>
                  )}
                  <TouchableOpacity onPress={() => deleteToDo(key)}>
                    <MaterialCommunityIcons
                      name="trash-can-outline"
                      size={24}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    flexDirection: "row",
    backgroundColor: theme.grey,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10,
  },
  toDoContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginLeft: 10,
  },
  toDoText: {
    color: "white",
    fontSize: 20,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
  },
  loading: {
    alignItems: "center",
    justifyContent: "center",
  },
});
