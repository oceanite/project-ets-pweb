const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  _data: {
    id: {
      fromMe: { type: Boolean, required: true },
      remote: { type: String, required: true },
      id: { type: String, required: true },
      participant: { type: String },
      _serialized: { type: String, required: true },
    },
    viewed: { type: Boolean, default: false },
    body: { type: String, required: true },
    type: { type: String, required: true },
    t: { type: Number, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    author: { type: String },
    ack: { type: Number, default: 0 },
    isNewMsg: { type: Boolean, default: false },
    star: { type: Boolean, default: false },
    isFromTemplate: { type: Boolean, default: false },
    isForwarded: { type: Boolean, default: false },
    hasReaction: { type: Boolean, default: false },
    disappearingModeInitiator: { type: String },
    disappearingModeTrigger: { type: String },
    groupMentions: [{ type: String }],
    mentionedJidList: [{ type: String }],
    labels: [{ type: String }],
    links: [{ type: String }],
    pollInvalidated: { type: Boolean, default: false },
    isSentCagPollCreation: { type: Boolean, default: false },
    lastUpdateFromServerTs: { type: Number, default: 0 },
    isDynamicReplyButtonsMsg: { type: Boolean, default: false },
    isCarouselCard: { type: Boolean, default: false },
    isMdHistoryMsg: { type: Boolean, default: false },
    isAvatar: { type: Boolean, default: false },
    isStatus: { type: Boolean, default: false },
    isStarred: { type: Boolean, default: false },
    isVcardOverMmsDocument: { type: Boolean, default: false },
    productHeaderImageRejected: { type: Boolean, default: false },
    lastPlaybackProgress: { type: Number, default: 0 },
  },
  mediaKey: { type: String },
  id: {
    fromMe: { type: Boolean, required: true },
    remote: { type: String, required: true },
    id: { type: String, required: true },
    participant: { type: String },
    _serialized: { type: String, required: true },
  },
  ack: { type: Number, default: 0 },
  hasMedia: { type: Boolean, default: false },
  body: { type: String, required: true },
  type: { type: String, required: true },
  timestamp: { type: Number, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  author: { type: String },
  deviceType: { type: String, required: true },
  isForwarded: { type: Boolean, default: false },
  forwardingScore: { type: Number, default: 0 },
  isStatus: { type: Boolean, default: false },
  isStarred: { type: Boolean, default: false },
  broadcast: { type: Boolean },
  fromMe: { type: Boolean, required: true },
  hasQuotedMsg: { type: Boolean, default: false },
  hasReaction: { type: Boolean, default: false },
  duration: { type: Number },
  location: { type: String },
  vCards: [{ type: String }],
  inviteV4: { type: String },
  mentionedIds: [{ type: String }],
  orderId: { type: String },
  token: { type: String },
  isGif: { type: Boolean, default: false },
  isEphemeral: { type: Boolean },
}, { _id: false });

module.exports = mongoose.model('Message', MessageSchema);