// components/songlist/index.js

Component({
  properties: {
    songList: Array,
  },
  data: {

  },
  methods: {
    go2SongList(e){
      //跳转歌单详情
      let d = e.currentTarget.dataset
      wx.navigateTo({
        url: `../songList/index?id=${d.id}&type=${d.type}`
      })
    },
  }
})
