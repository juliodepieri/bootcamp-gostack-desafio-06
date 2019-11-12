import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Starred,
  OwnerAvatar,
  Stars,
  Info,
  Title,
  Author,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    loading: false,
    page: 1,
    hasMorePages: true,
    refreshing: false,
  };

  async componentDidMount() {
    this.load();
  }

  load = async () => {
    const { navigation } = this.props;
    const user = navigation.getParam('user');
    const { stars, page, hasMorePages } = this.state;
    console.tron.log(`load: ${page}`);

    if (!hasMorePages) return;

    this.setState({ loading: true });
    const response = await api.get(`/users/${user.login}/starred?page=${page}`);

    this.setState({
      stars: [...stars, ...response.data],
      hasMorePages: response.data.length !== 0,
      loading: false,
    });
  };

  loadMore = async () => {
    const { page } = this.state;
    await this.setState({ page: page + 1 });
    this.load();
  };

  refreshList = async () => {
    const { refreshing } = this.state;

    if (!refreshing) {
      await this.setState({ stars: [], page: 1, hasMorePages: true });
      this.load();
    }
  };

  handleNavigation = repository => {
    const { navigation } = this.props;
    navigation.navigate('Repository', { repository });
  };

  render() {
    const { navigation } = this.props;
    const { stars, loading } = this.state;
    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        <Stars
          data={stars}
          keyExtractor={star => String(star.id)}
          onEndReachedThreshold={0.2}
          onEndReached={this.loadMore}
          onRefresh={this.refreshList}
          refreshing={this.state.refreshing}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                this.handleNavigation(item);
              }}
            >
              <Starred>
                <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                <Info>
                  <Title>{item.name}</Title>
                  <Author>{item.owner.login}</Author>
                </Info>
              </Starred>
            </TouchableOpacity>
          )}
        />

        {loading ? <ActivityIndicator color="#7159c1" /> : null}
      </Container>
    );
  }
}
