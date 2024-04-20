package org.openremote.agent.protocol.twitch;

import com.github.twitch4j.common.events.domain.EventChannel;

import java.util.Map;

public class TwitchChatMessageEvent {

    public Map<String, String> badges;
    public EventChannel channel;
    public String message;


    public TwitchChatMessageEvent() {

    }

    public Map<String, String> getBadges() {
        return badges;
    }

    public EventChannel getChannel() {
        return channel;
    }
    public String getMessage() {
        return message;
    }

    public TwitchChatMessageEvent setBadges(Map<String, String> badges) {
        this.badges = badges;
        return this;
    }
    public TwitchChatMessageEvent setChannel(EventChannel channel) {
        this.channel = channel;
        return this;
    }
    public TwitchChatMessageEvent setMessage(String message) {
        this.message = message;
        return this;
    }
}
