class DataUsers {
  Build(user) {

    let newUser = {
      _id: user._id,
      name: user.name,
      username: user.username == undefined ? '' : `${user.username}`,
      email: user.email,
      img: user.img,
      bio: user.bio,
      motivational: user.motivational,
      itemBio: user.itemBio,
      followers: user.followers == undefined ? [] : user.followers.map(userTemp => this.Build(userTemp)),
      following: user.following == undefined ? [] : user.following.map(userTemp => this.Build(userTemp)),
      followersIds: user.followers == undefined ? [] : user.followers.map(userTemp => userTemp._id),
      followingIds: user.following == undefined ? [] : user.following.map(userTemp => userTemp._id)
    }
    return newUser;
  }
}

module.exports = new DataUsers();
