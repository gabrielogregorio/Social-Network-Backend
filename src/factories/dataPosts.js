DataUsers = require('./dataUsers');

class DataPosts {
  Build(post, userId, idsSaves=[]) {
    let newPost = {
      _id: post.id,
      title: post.title,
      body: post.body,
      edited: post.edited,
      img: post.img,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      comments: post.comments,
      user: "",
      likes: post.likes == undefined ? 0 : post.likes.length,
      likedByUser: false,
      savedByUser: false,
      sharePost: post.sharePost == undefined ? undefined : post.sharePost
    }

    if (post.user != undefined) {
      newPost.user = DataUsers.Build(post.user)
    } else {
      newPost.user = {}
    }

    if (idsSaves != undefined) {
      idsSaves.forEach(idsave => {
        if (`${post._id}` == `${idsave}`) {
          newPost.savedByUser = true;
        }
      })
    }

    post.likes.forEach(postLike => {
      if (userId == postLike.user) {
        newPost.likedByUser = true;
      }
    })
    return newPost;
  }
}

module.exports = new DataPosts();
