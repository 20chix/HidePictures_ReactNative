import React from 'react';

import {
  View,
  Button,
  Text,
  Alert,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  StatusBar,
  TouchableHighlight
} from 'react-native';
import { NavigationActions } from 'react-navigation';


import MainTaNavigator from '../navigation/MainTabNavigator';
import { StackNavigator } from 'react-navigation';
import { AuthSession, ImagePicker, Helpers, SQLite } from 'expo';


import { Divider } from 'react-native-elements';
import Expo from 'expo';



const db = SQLite.openDatabase({ name: 'db5.db' });

class Items extends React.Component {
  state = {
    items: null,
  };

  async componentDidMount() {
    this.update();
  }
  render() {
    const { items } = this.state;
    if (items === null || items.length === 0) {
      return null;
    }

    return (
      <View>
        {items.map(({ id, done, value }) => (
          <TouchableOpacity
            key={id}>
            <Image source={{ uri: value }} style={{ width: null, height: 400 }} />
            <Divider />
            <Divider />
            <Divider />
            <Divider />
            <Divider />
          </TouchableOpacity>

        ))}

      </View>
    );
  }

  update() {
    db.transaction(tx => {
      tx.executeSql(
        `select * from items where done = ?;`,
        [this.props.done ? 1 : 0],
        (_, { rows: { _array } }) => this.setState({ items: _array })
      );
    });
  }
}


export default class login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      base64URI: null,
      image: null,
      text: null,
    };
  }

  _pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      base64: true
    });

    if (!result.cancelled) {
      try {
        //Concat the image type to the base64 data
        let message = 'data:image/png;base64, ' + result.base64;

        //Uploads the base64 to firebase as a raw string, with the specified metadata
        this.setState({ image: result.uri });

        //add into SQlite
        this.add(result.uri);
        this.setState({ text: null });

      }
      catch (err) {
        console.log(err);
      }
    }
  };
  componentDidMount() {
    db.transaction(tx => {
      tx.executeSql(
        'create table if not exists items (id integer primary key not null, done int, value text);'
      );
    });
  }

  render() {
    let { image } = this.state;
    return (
      <ScrollView>

        <Button 
            title="Add"
            onPress={() => this._pickImage()}
          />
          <Items
              done={false}
              ref={todo => (this.todo = todo)}
          />
      
      </ScrollView>
    )
  }
  add(text) {
    db.transaction(
      tx => {
        tx.executeSql('insert into items (done, value) values (0, ?)', [text]);
        tx.executeSql('select * from items', [], (_, { rows }) =>
          console.log(JSON.stringify(rows))
        );
      },
      null,
      this.update
    );
  }
  update = () => {
    this.todo && this.todo.update();
    this.done && this.done.update();
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  canvas: { flex: 1, width: null, height: null }
});